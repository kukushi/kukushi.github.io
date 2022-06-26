---
layout: post
title: Swift 如何正确的实现 Equatable
categories:
- Swift
tags: [Swift, Equatable]
status: publish
type: post
published: true
meta:
  structured_content: '{"oembed":{},"overlay":true}'
  _thumbnail_id: '90'
---

## 从 NSObject 的判等说起

相信所有的  Swift 开发者都碰到过（或将要碰到）实现 `NSObject` 子类的判等的坑。

历程大概是这样的，先凭纯熟的 Swift 直觉写出一个 `==` 实现：

```swift
class Object: NSObject {
    let value: Int
    
    init(value: Int) {
        self.value = value
    }
    
    static func ==(lhs: Object, rhs: Object) -> Bool {
        // 这里一般是由于业务需要，故意跳过了 NSObject 父类的判等
        lhs.value == rhs.value
    }
}
```

简单跑起来也非常正确，子类的 `==` 被正确调用了。

```swift
let a = Object(value: 1)
let b = Object(value: 1)
a == b // true
```

多测试一些 Case，发现在 `Object` 一旦在其他容器（ 如 `Optional`， 数组）里结果就不对了：

```swift
let a = Object(value: 1)
let b: Object? = Object(value: 1)
let isOptionalEqual = a == b
```

很显然，我们实现的 `Object` 的`==` 并没有被调用。通过调用堆栈可以发现被调用的是 `Object` 的  `isEqual` 方法。翻阅 [Swift 源码](https://github.com/apple/swift/blob/4c97d0cbe511157464042e10dcfe611acd5717d9/stdlib/public/Darwin/ObjectiveC/ObjectiveC.swift#L196)中 `NSObject` 中 `Equatable` 的实现：

```swift
// ObjectiveC.swift
extension NSObject : Equatable, Hashable {
  public static func == (lhs: NSObject, rhs: NSObject) -> Bool {
    return lhs.isEqual(rhs)
  }
// ...
}
```

那把判等逻辑移动到 `isEqual` 就万事大吉了！

```swift
class Object: NSObject {
    //...
  
    override func isEqual(_ object: Any?) -> Bool {
        guard let object = object as? Object else {
            return false
        }
        return value == object.value
    }
}
```

简单测试，这个实现结果基本正确。但为什么 `Object` 的 `==` 没有被调用呢？

再看看调用堆栈：

![Object Equal](https://raw.githubusercontent.com/kukushi/kukushi.github.io/master/images/object-equal.png)

> 注意图中的 **in conformance NSObject**

从上图，可以看出容器中的 `Object` 调用的是声明了遵循 `Equatable` 的 `NSObject` 的 `==`，而不是 `Object` 中的 `==`（实际上，这两个 `==` 的方法签名也不同）。这个“问题”看来和 `NSObject` 并没有关系，只是 `NSObject` 继承类是最容易发生这个 “问题” 场景。那这个现象的原因是什么呢？

## 继承与 Protocol 方法调度

在苹果官方的 SIL 文档中，介绍了继承与 Protocol 的关系：

> If a derived class conforms to a protocol through inheritance from its base class, this is represented by an *inherited protocol conformance*, which simply references the protocol conformance for the base class.
>
> [...]
>
> Witness tables are only directly associated with normal conformances. Inherited and specialized conformances indirectly reference the witness table of the underlying normal conformance.

Protocol 中定义的方法通过 PWT（Protocol Witness Table，与 V-Table 类似）进行调度。从文档可知，只有**显式声明了遵循**某个协议的类得到对应的 PWT，它的子类并不会得到一个独立的 PWT，而是直接使用父类的。

通过查看一段简单的代码生成的 SIL（Swift Intermediate Language，Swift 编译器生成 IR 之前的一个中间语言），可以验证这个逻辑：

```swift
class Parent: Equatable {
    /* final */static func ==(lhs: Parent, rhs: Parent) -> Bool {
        return true
    }
}

class Son: Parent {
    static func ==(lhs: Son, rhs: Son) -> Bool {
        return false
    }
}
```

生成 SIL：

```
swiftc -emit-sil -Onone main.swift > main.swift.sil
```

可以看到整个生成的 SIL  文件中，唯一一个 `sil_witness_table` 就是 `Parent` 的，`Son` 并没有独立的 PWT。

```swift
// ...

sil_witness_table hidden Parent: Equatable module main {
  method #Equatable."==": <Self where Self : Equatable> (Self.Type) -> (Self, Self) -> Bool : @$s4main6ParentCSQAASQ2eeoiySbx_xtFZTW // protocol witness for static Equatable.== infix(_:_:) in conformance Parent
}

//...
```

那么，是否可以通过 `override` 的方式覆盖掉父类的 `==` 方法，很遗憾，并不行，`static` 方法默认是 `final` 的。

## 如何正确的实现 Equatable

判等作为日常编程最简单基础的一项行为，也需要满足很多的特性，包括：

1. 反射性：对于 `x`，`x == x` 应该是 `true`。
2. 对称性：对于 `x` 和 `y`，`y == x` 与 `x == y` 应返回相同的值。
3. 传递性：对于 `x` `y` `z`，当 `x == y`，`y == z` 都为 `true` 时，`x == z` 也应为 `true`。
4. 一致性：对于 `x` `y`，当不修改 `x` 和 `y` 的属性时，`x == y` 的结果无论多少次执行都应一致。
5. 对于非空的 `x`，`x == nil` 的结果应为 `false`。

上述几条特性看起来平平无奇，但一旦涉及到父类／子类混合判等，实际要全部满足有相当的难度。除非你是 `struct` 的忠实爱好者，否则在代码库中总能找到几个不完全符合上述特性的 `==` 实现。 一位发表了 2007 篇论文的作者也曾断论：几乎所有 Java `equals` 方法的实现都是错误的。[^1]

回到 `==` 的实现，既然不能 override，我们可以把 `==` 中判等实现剥离出一个独立方法，这样子类可以继承。这也正是 `NSObject` 的实现方式。于是乎，我们有了一个比较通用的实现：

```swift
class Parent: Equatable {
    let a: Int
    init(a: Int) {
        self.a = a
    }
    
    /* final */static func ==(lhs: Parent, rhs: Parent) -> Bool {
        return lhs.isEqual(rhs)
    }
    
    func isEqual(_ object: Parent) -> Bool {
        a == object.a
    }
}

class Son: Parent {
    let b: Int
    init(a: Int, b: Int) {
        self.b = b
        super.init(a: a)
    }

    override func isEqual(_ object: Parent) -> Bool {
        guard let son = object as? Son else { return false }
        return super.isEqual(object) && b == son.b
    }
}
```

感谢 Swift 良好的类型系统，大部分判等的特性都自动满足了，但很快就发现其实这并不满足传递性：

```swift
 a == s // true
 a == s2 // true
 s == s2 // false
```

为此需要再加上一些类型检查：

```swift
class Parent: Equatable {
    let a: Int
    init(a: Int) {
        self.a = a
    }
    
    /* final */static func ==(lhs: Parent, rhs: Parent) -> Bool {
        return lhs.isEqual(rhs)
    }
    
    func isEqual(_ object: Parent) -> Bool {
        object.canEqual(self) && a == object.a
    }
    
    func canEqual(_ object: Parent) -> Bool {
        true // object is Parent
    }
}

class Son: Parent {
    let b: Int
    init(a: Int, b: Int) {
        self.b = b
        super.init(a: a)
    }

    override func isEqual(_ object: Parent) -> Bool {
        guard let son = object as? Son else { return false }
        return object.canEqual(self) && super.isEqual(object) && b == son.b
    }
    
    override func canEqual(_ object: Parent) -> Bool {
        object is Son
    }
}
```

> 备注：如果有用到 `Hashable`，子类需要 override `hash(into hasher:`，否则在 Dictionary 与 Set 中可能会冲突。

这个实现来自 Scala 语言的作者 **Martin Odersky**，精巧之处在于 `canEqual` 的实现使得父类与子类的判等结果必定是 `false`，保证了传递性。在这个实现下，我们设定了一个隐式的“约定”，即子类在实现判等时候需要实现 `canEqual`，这类约定在大型项目中往往难以保证必定得到满足，也常常是一些 Bug 的源头。因此，`struct` 和减少继承层级其实是更为推荐的做法，这样一个简单的 `==` 就能满足所有的需求。

## Takeaway

- `NSObject` 子类判等调用 `isEqual` 的现象并不是一个 Bug，而是 Protocol 与继承组合起来的奇怪结果。
- 对于 Swift 语言特性的探究，SIL 是一个很好的工具。
- 多层继承下实现一个正确的 `Equatable` 费事费力，优先考虑 `struct` 或减少继承层级。

全文完

## 参考

- [NSObject Equality is Tricky](https://noahgilmore.com/blog/nsobject-equatable/)
- [Implement Equatable protocol in a class hierarchy - Swift Forum](https://forums.swift.org/t/implement-equatable-protocol-in-a-class-hierarchy/13844)
- [How to Write an Equality Method in Java](https://www.artima.com/lejava/articles/equality.html)
- [swift/docs/SIL.rst](https://github.com/apple/swift/blob/main/docs/SIL.rst#witness-tables)

[^1]: [How to Write an Equality Method in Java](https://www.artima.com/lejava/articles/equality.html)
