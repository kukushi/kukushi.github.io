---
layout: post
title: 'QuickNote: Swift Dynamic Member Lookup 和 Subscript'
categories:
- iOS
tags: [QuickNote, Swift]
status: publish
type: post
published: true
meta:
  structured_content: '{"oembed":{},"overlay":true}'
  _thumbnail_id: '90'
---

> `@dynamicMemberLookup` attribute requires `XXX` to have a `subscript(dynamicMember:)` method that accepts either `ExpressibleByStringLiteral` or a keypath.

[Dynamic Member Lookup 结合 KeyPath](https://www.avanderlee.com/swift/dynamic-member-lookup/) 能组合出无缝访问其他类型 Property 的效果。

不过极少提到的是，**`subscript` 和属性一样可以被 `keyPath` 访问到！**这样看来 `subscript` 和 Property 本质上非常相近，都是一对 `setter` 和 `getter`。

```swift
@dynamicMemberLookup
class MemberDelegater<ObjectType> {
    let object: ObjectType
    
    init(_ object: ObjectType) {
        self.object = object
    }
    
    subscript<Value>(dynamicMember keyPath: ReferenceWritableKeyPath<ObjectType, Value>) -> Value {
        get {
            object[keyPath: keyPath]
        }
        set {
            object[keyPath: keyPath] = newValue
        }
    }
}

class RunMebmberLookup: Runnable {
    class Writer {
        var result: String {
            get {
                return "Property Getter"
            }
            set {}
        }
        
        subscript(index i: String, index2 i2: String) -> String {
            get {
                return "Subscript Getter"
            }
            set {
                print("Subscript Setter")
            }
        }
    }
    static func run() {
        let writer = Writer()
        let member = MemberDelegater(writer)
        // 通过 Dynamic Member Lookup 访问 subscript
        let result = member[index: "123", index2: "123"]
        // 通过 Dynamic Member Lookup 访问属性
        let result2 = member.result
        print(result, result2)
    }
}
```

TCA 的 `ViewStore.binding` 就使用了这个技巧。
