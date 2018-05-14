---
layout: post
title: iOS UI Testing 不完全踩坑指南
categories:
- iOS
tags: [UITesting, iOS]
status: publish
type: post
published: true
meta:
  structured_content: '{"oembed":{},"overlay":true}'
  _thumbnail_id: '90'
---
最近研究了一下 UI Testing 的使用，发现还是有蛮多坑的，本文会介绍笔者遇到的坑和解决方案。本文不会涉及到如何编写一个 Test Case，因此希望你已经大致了解 UI Testing （可以看 onevcat 大大的[介绍](https://onevcat.com/2015/09/ui-testing/)） 和 [UI Testing Cheat Sheet](https://github.com/joemasilotti/UI-Testing-Cheat-Sheet).

## 与宿主应用 (Host App) 交互

UI Testing 运行在另外一个进程中，因此直接无法访问宿主应用的信息。那当我们希望在特定的启动条件下测试应用，要如何操作呢？ 答案是利用 `XCUIApplication` 的 `launchArguments`。
> 测试进程还是可以通过 Inter-process communication 与宿主进程通信，`XCUIElement` 的查询就是这么实现的。

首先，需要在 Test 中设定参数：

```swift
let app = XCUIApplication()
app.launchArguments = ["ResetDefaults"]
app.launch()
```

其次，在宿主应用中添加处理这些参数的代码：

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
    
    #if DEBUG
    var arguments = ProcessInfo.processInfo.arguments
    arguments.removeFirst()
    setupTestingEnvironment(with: arguments)
    #endif
    
    configureSideMenu()
    return true
}
```

当然，这种做法的坏处是测试代码侵入了应用代码。虽然可以通过使用宏让这些代码在 Release 状态下不生效，但还是无法保持代码的整洁。

## 更优雅的 `XCUIElement` 获取

在使用自动录制生成测试代码时，经常会产生令人非常费解的获取 `XCUIElement` 的代码。这种代码基本无法理解，更谈不上维护了。

```swift
let validationPopup = app.children(matching: .window).element(boundBy: 0)
.children(matching: .other).element(boundBy: 1).children(matching: .other).element(boundBy: 1)
```

如何改善这种情况呢？让我们回忆一下，UI Testing 是构建与 [Accessibility](https://developer.apple.com/library/content/documentation/UserExperience/Conceptual/iPhoneAccessibility/Introduction/Introduction.html) 之上的，Accessibility 提供了一个 `accessibilityIdentifier` 属性，利用它，可以帮助我们减少自动生成的代码。
> An identifier can be used to uniquely identify an element in the scripts you write using the UI Automation interfaces. Using an identifier allows you to avoid inappropriately setting or accessing an element’s accessibility label.

```swift
class CustomView: UIView {
    // ...
}

let view = CustomView()
view.accessibilityIdentifier = "CustomView"

// Testsing
let customView = app.otherElements["CustomView"]
```

## 获取调试信息

`debugDescription` 可以输出当前视图的层级结构，查看更多的信息。

```swift
let element = /* can be element or app */
print(element.debugDescription)
```

## 强制点击

有时候，系统会错误的认为按钮是不可点击的（如在 TableView 中的按钮），这时你尝试通过 `tap()` 点击按钮会触发 `Unable to find hit point`。这时可以使用 `XCUICoordinate` 签证强制点击:

```swift
/// force taps a view if it reports to be not hittable - useful for buttons in cells
func forceTap() {
    if isHittable {
        self.tap()
    } else {
        // You can also try (0, 0)
        let coordinate: XCUICoordinate = self.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
        coordinate.tap()
    }
}
```

## 切换输入框

这也是个很奇怪的问题。Testing 在多个输入框切换焦点是会莫名的失败，如：

```swift
let userNameTextField = app.textFields["username"]
userNameTextField.tap()
userNameTextField.typeText(userName)

let passwordField = app.textFields["password"]
passwordField.tap() // Error!!!
passwordField.typeText(userName)
```

`passwordField.tap()` 可以无法正确的执行。一个 workaround 在第一个输入框输入完成之后，将键盘弹下再弹出，然后尝试输入：

```swift
/// hides keyboard if present & obstructs hit space
func hideKeyboardIfNeeded() {
    if keyboardHideButton.coordinate(withNormalizedOffset: CGVector.zero).screenPoint.x < UIScreen.main.bounds.width {
        keyboardHideButton.tap()
    }
}
```