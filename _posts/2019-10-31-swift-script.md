---
layout: post
title: Swift 脚本方案简析
categories:
- Swift
tags: [Shell, productivity]
status: publish
type: post
published: true
meta:
  structured_content: '{"oembed":{},"overlay":true}'
  _thumbnail_id: '90'
---

几年前，"人生苦短，我用 Python" 这种说法还颇为流行，受此影响，我也试着 Python 写了几个脚本。Python 作为动态语言，写起来确实是行云流水，酣畅淋漓。可惜好景不长，几个月后我再次打开这些 Python 脚本，看着这些代码的时候不禁发出了哲学三问：“你是什么类型？你在哪里被定义？你在哪里被使用”？（当然这和我薄弱的 Python 熟练度有关）。这时候我想，我能否使用强类型的 Swift 编写脚本呢？答案是肯定的，而且已经有不少开源大佬都在这条路上作出了贡献。

> 本文基于 macOS & Swift 5.1 编写。

## 先驱：Marathon

相信每一位学习过 Swift 的同学都或多或少从 [Swift by Sundell](https://www.swiftbysundell.com) 博客中获益过。 [Marathon](https://github.com/JohnSundell/Marathon) 是高产的 Sundell 基于 Swift Package Manager 开发的帮助开发者开发命令行的工具，提供了依赖管理、编译、安装等功能。

作为示例，让我们来编写一个脚本，在终端中用浏览器打开当前目录 Git 仓库的地址。举个🌰，在 Alamofire 的目录下执行这个脚本，就会在浏览器中打开 [https://github.com/Alamofire/Alamofire](https://github.com/Alamofire/Alamofire).  

首先使用 `marathon` 新建一个脚本：

```shell
marathon create ogu # ogu is short for 'open git url'
```

> Marathon 内部在 `~/.marathon/Script/Cache` 目录下创建了一个新的 Swift Package，后续的依赖管理、编译都基于这个 Package 展开。

接着开始编辑脚本：

```shell
marathon edit ogu
```

键入实际的代码：

```swift
import Foundation
import ShellOut // marathon:https://github.com/JohnSundell/ShellOut.git
import Rainbow // marathon:https://github.com/onevcat/Rainbow.git
import Files // marathon:https://github.com/JohnSundell/Files.git

func main() {
    let notAGitRepoDescription = "fatal: not a git repository (or any of the parent directories): .git"
    
    guard let origins = try? shellOut(to: "git remote") else {
        print(">>> Failed to parse git remote address")
        return
    }

    guard origins != notAGitRepoDescription else {
        print(">>> Not a git repo")
        return
    }

    let originList = origins.components(separatedBy: "\n")
    if originList.isEmpty {
        print(">>> Don't have remote yet")
    } else if originList.count == 1, let onlyOrigin = originList.first {
        openURL(from: onlyOrigin)
    } else {
        for (i, origin) in originList.enumerated() {
            print("\(i): \(origin)")
        }
        print(">>> Please select one of the remote to open: [0..<\(originList.count)]")
        
        guard let input = readLine(),
            let selectedIndex = Int(input),
            0..<originList.count ~= selectedIndex else {
                print(">>> Not a validate input")
                return
        }
        openURL(from: originList[selectedIndex])
    }
}

func openURL(from origin: String) {
    guard let gitAddress = try? shellOut(to: "git remote get-url \(origin)"),
        let address = convertGitAddressToWebURL(from: gitAddress) else {
            print(">>> Failed to parse git remote address")
            return
    }
    
    print(">>> Opening remote [\(origin.red)]: " + address.underline)
    do {
        try shellOut(to: "open \(address)")
    } catch {
        print("Failed to open \(address), error: \(error.localizedDescription)")
    }
}

func convertGitAddressToWebURL(from urlString: String) -> String? {
    if urlString.hasPrefix("https:") && urlString.hasSuffix(".git") {
        return String(urlString.prefix(urlString.count - 4))
    } else if urlString.hasPrefix("git@") && urlString.hasSuffix(".git") {
        let webAddress = urlString.replacingOccurrences(of: ":", with: "/")
            .replacingOccurrences(of: "git@", with: "https://")
        return String(webAddress.prefix(webAddress.count - 4))
    }
    return nil
}

main()
```

可以看到，和普通的 Swift 代码唯一的不同支出就是 `import` 之后的注释，它让 `marathon` 知道这个依赖的地址。

编写完成后，通过 `marathon run ogu --verbose` 执行这个脚本。确认实现符合预期后，执行 `marathon install ogu` 将编译好的执行文件安装到 `/usr/local/bin`，这样在命令行输入 `ogu` 就可以直接执行我们的脚本了。

Marathon 对 SPM 的封装大幅的简化了编写脚本的难度。但目前并**不推荐**使用它来编写脚本，为什么呢？接着往下看。

## swift-sh

homebrew 的作者 mxcl 在 Apple 短暂参与过 Swift Package Manager 的开发后，开源了 [swift-sh](https://github.com/mxcl/swift-sh)，同样是一款帮助开发者简化脚本编写工作的工具。 在使用上，swift-sh 和 Marathon 除了命令不同外并没有很大区别。

将上面的代码替换掉头部，我们便得到了一个 swift-sh 脚本：

```swift
#!/usr/bin/swift sh

import Foundation
import ShellOut // @JohnSundell ~> 2.0.0
import Rainbow // @onevcat ~> 3.1.5
import Files // @JohnSundell ~> 4.0.0

// ...
```

执行 `swift sh edit ogu` 可以执行这个脚本。swift-sh 巧妙的利用了 swift 命令提供的子命令（subcommand）拓展特性，`swift sh abc` 实际执行的是 `swift-sh abc`。

> 由于一些原因，目前 swift-sh 的[自动补全失效](https://github.com/mxcl/swift-sh/issues/87) 了。

执行 `swift sh ogu.swift` 可以直接执行这个脚本。swift-sh 内部也使用了 SPM 对依赖进行管理。

此外，`swift sh` 非常贴心的支持将脚本转换成一个 Swift Package：

```shell
swift sh eject ogu.swift
```

遗憾的是，`swift-sh` 并没有提供方法将编译后的可执行文件直接安装到 `usr/bin/local` 中，可以通过 `~/Library/Developer/swift-sh.cache/ogu/.build/release` 里找到编译结果放到 `usr/bin/local`。

## Swift Package Manager

上述的两款工具都是基于 SPM 开发，那能否用 SPM 直接写脚本呢？当然可以，经过数年的开发，SPM 也日渐成熟，原先繁琐的操作得以简化，也正是这个原因，[Marathon 宣布放弃维护](https://github.com/JohnSundell/Marathon/issues/208)，转而推荐开发者直接使用 SPM。

新建一个可执行文件的 Swift Package：

```shell
swift package init --type executable
```

核心脚本代码部分并不需要改动。类似的，我们需要以某种方式指定依赖，这一次是 Package.swift:

```swift
// swift-tools-version:5.1
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "spm",
    products: [.library(name: "MarathonDependencies", type: .dynamic, targets: ["spm"])],
    dependencies: [
        .package(url: "https://github.com/JohnSundell/Files.git", from: "4.0.0"),
        .package(url: "https://github.com/onevcat/Rainbow.git", from: "3.0.0"),
        .package(url: "https://github.com/JohnSundell/ShellOut.git", from: "2.0.0")
    ],
    targets: [
        .target(
            name: "spm",
            dependencies: ["Files", "Rainbow", "ShellOut"])
    ],
    swiftLanguageVersions: [.version("5")]
)

```

执行 `swift package resolve` 解析并获取依赖。通过 `swift package generate-xcodeproj` 生成一个 Xcode 工程后，可以直接用 Xcode 编辑。

> 记得将运行环境修改为 Mac！

可以直接使用 `swift build` 将 Package 编译为一个二进制文件，这个二进制文件位于当前目录下 `.build/release` 目录下。

```shell
swift build -c release
```

最后，手动将编译好的文件放入 `/usr/local/bin` 中就大功告成了。

```
install .build/release/ogu /usr/local/bin
```

## 总结

对于单文件的脚本，`swift-sh` 无疑是最佳的选择。而当脚本日益增大，将它转换成一个 Swift Package 维护则是一个更好的选择。

## 参考链接

- [Swift Package Manager](https://swift.org/package-manager/)
- [swift-sh - NSHipster](https://nshipster.com/swift-sh/)
