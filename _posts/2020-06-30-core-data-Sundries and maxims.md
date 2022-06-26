---
layout: post
title: WWDC20 10017 - Core Data 杂项与准则
categories:
- Swift
tags: [WWDC, Core Data]
status: publish
type: post
published: true
meta:
  structured_content: '{"oembed":{},"overlay":true}'
  _thumbnail_id: '90'
---

> 本文是对 WWDC 2020 [Core Data: Sundries and maxims](https://developer.apple.com/videos/play/wwdc2020/10017/) Session 的翻译。

本 Session 将从三个方面介绍如何优化 Core Data 性能：

- 使用批量操作
- 定制查询操作
- 响应变化通知

下面会以这个[地震信息列表 Demo](https://developer.apple.com/documentation/coredata/loading_and_displaying_a_large_data_feed) 为例，说明上面的内容：

![](https://images.xiaozhuanlan.com/photo/2020/6b44c1dd8f4d5e52a887d615ecb2a949.png)
示例中，从 USGS（美国地质调查局） 获取到 JSON Feed 通过 JSON Parser 解析后，通过 Background Context 存入到持久化存储中，View Context 合并过数据后交给显示层。

在上面的过程中，大量的 Managed Object 在被创建保存之后立即就被废弃了。这正是批量操作的使用场景。

## 批量操作

批量操作在保持轻量的同时支持插入、更新和删除，但它没有提供结果的通知或回调。一个解决方案是开启持久化历史（Persistent History），这样我们可以得到批量操作的通知。至于回调，我们可以通过解析持久化历史来找出对应的变化。

```swift
storeDesc.setOption(true as NSNumber, forKey: NSPersistentHistoryTrackingKey)
```

接下来会详细解说各个批量操作。

### 批量插入

iOS 14 在 `NSBatchInsertRequest`  上新增了一套基于 Block 的批量插入 API：

```swift
// NSBatchInsertRequest.h

@available(iOS 13.0, *)
open class NSBatchInsertRequest : NSPersistentStoreRequest {
    open var resultType: NSBatchInsertRequestResultType

    // iOS 13 旧接口，通过数组批量插入
    public convenience init(entityName: String, objects dictionaries: [[String : Any]])
    public convenience init(entity: NSEntityDescription, objects dictionaries: [[String : Any]])

    // iOS 14 新增，通过 Block 批量插入
    @available(iOS 14.0, *)
    open var dictionaryHandler: ((inout Dictionary<String, Any>) -> Void)?
    open var managedObjectHandler: ((inout NSManagedObject) -> Void)?

    public convenience init(entity: NSEntityDescription, dictionaryHandler handler: @escaping (inout Dictionary<String, Any>) -> Void)
    public convenience init(entity: NSEntityDescription, managedObjectHandler handler: @escaping (inout NSManagedObject) -> Void)
}
```

举个🌰，不使用 Batch 逐个插入新对象：

```swift
// Earthquakes Sample - Regular Save

   for quakeData in quakesBatch {
        // 逐个创建 Entity
        guard let quake = NSEntityDescription.insertNewObject(forEntityName: "Quake", into: taskContext) as? Quake else { ... }
        do {
            // 逐个填充数据
            try quake.update(with: quakeData)
        } catch QuakeError.missingData {
            ...
            taskContext.delete(quake)
        }
        ...
    }
    do {
        try taskContext.save()
    } catch { ... }
```

使用老的数组式 Batch Request 插入对象：

```swift
// Earthquakes Sample - Batch Insert

// 构建数组
var quakePropertiesArray = [[String:Any]]()
for quake in quakesBatch {
    quakePropertiesArray.append(quake.dictionary)
}

let batchInsert = NSBatchInsertRequest(entityName: "Quake", objects: quakePropertiesArray)

var insertResult : NSBatchInsertResult
do {
    insertResult = try taskContext.execute(batchInsert) as! NSBatchInsertResult
    ... 
}
```

使用 iOS 14 新加的 Block 式 Batch：

```swift
//Earthquakes Sample - Batch Insert with a block

var batchInsert = NSBatchInsertRequest(entityName: "Quake", dictionaryHandler: { 
    (dictionary) in
        if (blockCount == batchSize) {
            // 返回 true 表示结束
            return true
        } else {
            dictionary = quakesBatch[blockCount]
            blockCount += 1
        }
    })
    var insertResult : NSBatchInsertResult
    do {
        insertResult = try taskContext.execute(batchInsert) as! NSBatchInsertResult
        ...
    }
```

让我们来看看这三种方式在插入大量数据时性能上的差别：

| 方式                      | 操作耗时 | 内存       |
| ------------------------- | -------- | ---------- |
| 无 Batch                  | 62s      | 31M        |
| iOS 13 数组式 Batch       | 30s      | 25.2 M     |
| **iOS 14 Block 式 Batch** | **11s**  | **24.3 M** |

**Block 式 Batch 无论在耗时还是在内存峰值上都有最好的表现。**非 Batch 的耗时主要花费在合并数据更变 Notification 上了。

#### 自动合并对象

在 Core Data 文件的 Entities 的 右侧 Core Data Inspector 编辑栏 ，将属性加入到 **Constraints** 后，就在这个属性上建立了一个 Unique 的约束。设置 `mergePolicy` 可以让 Core Data 自动支持 Model 更新。

```swift
managedObjectContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
```

### 批量更新

`NSBatchUpdateRequest` 支持快速批量的更新数据，我们无需再经历查询、更新、保存的老流程。下面的代码将所有 `magitute` 大于 `2.5` 的数据的 `validate` 属性更新为 `true`：

```swift
// Earthquakes Sample - Batch Update
let updateRequest = NSBatchUpdateRequest(entityName: "Quake")
updateRequest.propertiesToUpdate = ["validated" : true]
updateRequest.predicate = NSPredicate("%K > 2.5", "magnitude")

var updateResult : NSBatchUpdateResult
do {
    updateResult = try taskContext.execute(updateRequest) as! NSBatchUpdateResult
    ... 
}
```

### 批量删除

`NSBatchDeleteRequest` 支持：

- 批量删除对象图中的大部分内容
- 遵守对象关系。删除是级联的，关系也会被置空
- 适用于清理过期对象或控制对象的 TTL（存活时间）

下面的代码在后台线程将删除所有 `creationDate` 在 30 天之前的数据：

```swift
// Batch Delete without and with a Fetch Limit
DispatchQueue.global(qos: .background).async {
    moc.performAndWait { () -> Void in
       do {
           let expirationDate = Date.init().addingTimeInterval(-30*24*3600)

           let request = NSFetchRequest<Quake>(entityName: "Quake")
           request.predicate = NSPredicate(format:"creationDate < %@", expirationDate)

           let batchDelete = NSBatchDeleteRequest(fetchRequest: request)
           // batchDelete.fetchLimit = 1000
           moc.execute(batchDelete)
        }
    }
}
```

代码十分简单但也存在一个问题，如果需要处理的数据足够多，那么会耗费相当长的不受控的时间去执行。为了解决这一问题，可以设置 `fetchLimit` ，让耗时回到可控的范围内。

## 定制查询请求

在编写查询请求时，我们可以问问自己“真的需要这么多数据吗”。通常通过裁剪查询请求，我们可以获得更好的性能。`NSFetchRequest` 的 `resultType` 属性允许我们控制查询结果的类型。

### 查询对象

`managedObjectResultType` 支持以**对象**作为查询结果，支持对象图的完整遍历，特别适用与 `FetchResultController` 配合使用。

#### 控制 Batch 数量

![](https://images.xiaozhuanlan.com/photo/2020/924594855037eea167c224f11df0b946.png)

在界面上显示出的 Cell 个数只有 15 个，而我们实际拉取的数量远远高于这个数字，这里就存在优化空间。通过控制 `fetchBatchSize` ，我们可以仅让前排需要展示的对象填充数据（Hydrate）。

批量获取的 Array 与普通的 Array 行为不同。

普通 Array 中所有的数据都是已经填充过的：
![普通 Array](https://images.xiaozhuanlan.com/photo/2020/407a1dc02bde82a9f4b460d0cd61783a.png)

Batch Array 中只有当前 Batch 对应的数据会被填充成 Managed Object，其他都是以 ObjectID 存在：

![Batch](https://images.xiaozhuanlan.com/photo/2020/e114bf374196612a62300c44d9d9deff.png)

通过开启 `fetchBacthSize` ，在我们的 Demo 中，内存使用从 17M 降低到了 12M！🎉

#### 按需读取属性

Core Data 允许我们精细的控制需要获取的属性：

```swift
@available(iOS 3.0, *)
open var propertiesToFetch: [Any]?
```

设置了 `propertiesToFetch` 后，Demo 的应用内存下降了 1.2 M!

CoreData 为了节省内存占用，默认会用一个占位对象表示尚未加载到内存中的关联对象，当第一次访问到这个对象时才触发加载，这个过程被称为 faluting。当我们明确知道某些对象一定会被遍历到，那将这些对象*预拉取* 可以获得更好的性能。

```swift
@available(iOS 3.0, *)
open var relationshipKeyPathsForPrefetching: [String]?
```

### Object IDs

不同于 Object， ObjectID 是线程安全的，因此可以在不同的线程之间传递，适用于只需要进行识别筛选对象的场景。

### 字典数据

通过将 `resultType` 设置为 `dictionaryResultType`，查询结果会以字典的形式展示。这些轻量的可以安全的传递到其他线程，同时也支持一些复杂的数据统计操作。下面的代码以地区 (`place`) 为单位计算了震幅的平均值：

```swift
// Fetch average magnitude of each place

let magnitudeExp = NSExpression(forKeyPath: "magnitude")
let avgExp = NSExpression(forFunction: "avg:", arguments: [magnitudeExp])

let avgDesc = NSExpressionDescription()
avgDesc.expression = avgExp
avgDesc.name = "average magnitude"
avgDesc.expressionResultType = .floatAttributeType

let fetch = NSFetchRequest<NSFetchRequestResult>(entityName: "Quake")
fetch.propertiesToFetch = [avgDesc, "place"]
fetch.propertiesToGroupBy = ["place"]
fetch.resultType = .dictionaryResultType
```

### 数量统计

通过将 ``resultType`` 设置为 `countResultType` ，可以获得查询结果的数量统计。简单实用，不多说了。

## 响应通知

Core Data 提供了丰富的通知，让应用可以实时得知数据的变化。本文将着重介绍 `ObjectID` 通知和远端改变通知。

### `objectID` 通知

iOS 14 中新增了 ObjectID 相关的通知，与 Managed Object 的通知相对应，是由持久性历史事务生成。这些通知也终于 Swift 化。

```swift
//NSManagedObjectContext.h
@available(iOS 14.0, *)
extension NSManagedObjectContext {
    public static let willSaveObjectsNotification: Notification.Name
    public static let didSaveObjectsNotification: Notification.Name
    public static let didChangeObjectsNotification: Notification.Name
  
    // ObjectID
    public static let didSaveObjectIDsNotification: Notification.Name
    public static let didMergeChangesObjectIDsNotification: Notification.Name
}
```

```swift
//NSManagedObjectContext.h
@available(iOS 14.0, *)
extension NSManagedObjectContext {
    public enum NotificationKey : String {  
        case sourceContext
        case queryGeneration
        case invalidatedAllObjects
        case insertedObjects
        case updatedObjects
        case deletedObjects
        case refreshedObjects
        case invalidatedObjects
        // Object ID
        case insertedObjectIDs
        case updatedObjectIDs
        case deletedObjectIDs
        case refreshedObjectIDs
        case invalidatedObjectIDs
    }
}
```

### 远端更变通知

远程更变通知提供的信息量非常大，在我们进程内外的所有操作都会使 CoreData 客户端发送一个通知 。这允许我们避免轮询查询变化，而是由通知驱动。

开启远端更变通知也非常简单：

```swift
storeDesc.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
storeDesc.setOption(true as NSNumber, forKey: NSPersistentHistoryTrackingKey)
```

![](https://images.xiaozhuanlan.com/photo/2020/9378bc8e6cb0fa9b5261fa1d72adaecd.png)

开启了远程改变通知后，应用可以接收到进程外的数据改变（如 Share Extension），并且可以知道是哪个进程，在什么时刻，在哪里改变了什么数据。

值得一提的是，对于持久化历史的查询也同样支持通过条件裁剪：

```swift
let changeDesc = NSPersistentHistoryChange.entityDescription(with: moc)
let request = NSFetchRequest<NSFetchRequestResult>()

// Set fetch request entity and predicate
request.entity = changeDesc
// 仅查询指定 ID 的数据
request.predicate = 
    NSPredicate(format: "%K = %@",changeDesc?.attributesByName["changedObjectID"], objectID)
   
// Set up history request with distantPast and set fetch request              
let historyReq = NSPersistentHistoryChangeRequest.fetchHistory(after: Date.distantPast)
historyReq.fetchRequest = request
                    
let results = try moc.execute(historyReq)
```

## 总结

1. 尽可能使用批量操作
2. 按需查询
3. 充分利用通知
