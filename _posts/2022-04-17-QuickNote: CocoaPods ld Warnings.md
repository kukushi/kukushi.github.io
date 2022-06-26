---
layout: post
title: 'QuickNote: CocoaPods ld Warnings'
categories:
- iOS
tags: [QuickNote, CocoaPods]
status: publish
type: post
published: true
meta:
  structured_content: '{"oembed":{},"overlay":true}'
  _thumbnail_id: '90'
---
> QuickNote 系列文章旨为以简短的篇幅描述具体问题的解决方案。

最近在维护 Mufu 的时候发现了很多类似下面的警告：

```
ld: warning: object file (...) was built for newer iOS version (9.0) than being linked (8.0)
```

大意为，这个 Object 文件编译适配的 iOS 版本（9.0）高于当前的版本（8.0）。奇怪的是，Mufu 的 Deployment Target 是 iOS 13，不符合上面的逻辑。再仔细看下，发现上面的警告都来自于 Pods，Pod 中很多库的 Deloyment Target 都设的很低，其中就有 iOS 8 的。

CocoaPods 1.0 前会自动将 project 的 deployment target 设置到各个 Pod 中，但在 1.0 之后取消了这个行为。为了解决上面的警告，我们还是需要将各个 Pod 的 Deployment Target 更新上来。在这种情况下，[CocoaPods 的作者建议用 Post-Install Hook](https://github.com/CocoaPods/CocoaPods/issues/4859)，在 Podfile 末尾加上：

```
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
    end
  end
end
```
