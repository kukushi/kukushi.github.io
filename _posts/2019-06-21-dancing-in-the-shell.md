---
layout: post
title: 在命令行中舞蹈
categories:
- iOS
tags: [Shell, productivity]
status: publish
type: post
published: true
meta:
  structured_content: '{"oembed":{},"overlay":true}'
  _thumbnail_id: '90'
---

在我们的日常开发工作中，通常有一部分重复性的工作。这些工作一般复杂度很低，对认知要求不高，属于浮浅工作，存在很大的自动化空间，因此最适合在命令行中完成。将这类工作尽量简化，我们可以更专注的投入到更有价值的深度工作中，提升工作效率。

本文总结了帮助我节省了无数时间的一些经验，希望对你也有帮助。

## 目录定位

在终端中，定位到指定目录通常需要数次的 `cd` 与 `ls`，繁琐的操作让每一个想打开终端的人却步。

我们需要一个工具在目录之间快速跳转，而 [`fasd`](https://github.com/clvv/fasd) 正是这样的工具。`fasd` 帮助我们直接跳转切换过的目录。

```shell
$ j some_directory
```

> 对于一些已经在 Finder 中打开了目录的场景，可以使用 [go2Shell](https://zipzapmac.com/Go2Shell) 在命令行直接切换到当前目录。

在使用 `fasd` 的初期，它通常能百分百命中我们预期的目录。然而经过一段使用之后，这段时间内切换过的目录可能会污染 `fasd` 的预测结果。

简单查阅 `fasd` 的文档，可以知道它的数据存储在 `~/.fasd` 文件中，每一行存储了目录的相关信息:

```shell
/Users/kukushi/Documents/Project|10.7195|1547211464
```

`|` 划分了目录，访问频率，上一次访问时间。利用这些信息，我们可以对 `.fasd` 进行一些清理。于是乎，我编写了[一个脚本](https://gist.github.com/kukushi/d1223b1a021addce3cd2a2a3cab6d726)执行一些简单的清理，让跳转更加的精确。

将以下代码 `.zshrc`  / `.bashrc` 下，终端每次启动时都会执行此脚本。

```shell
# 需要将这个路径改为你存放这个脚本的路径
cleanFASDScript=~/Documents/Scripts/script/clean_fasd.py
if [ -f "$cleanFASDScript" ]; then
  python3 "$cleanFASDScript" -s true
fi
```

## 打开工程

进入到工作目录后，我们需要打开工程文件。
对于 Xcode 工程，它提供了 `xed` 命令让开发者从命令行打开工程文件。

```
xed

Opens files for editing in XCode.

- Open file in XCode:
    xed file1

- Open file(s) in XCode, create if it doesn't exist:
    xed -c filename1

- Open a file in XCode and jump to line number 75:
    xed -l 75 filename
```

但是，在一些 Edge Cases，如目录下没有工程文件，`xed` 会尝试 Markdown 或其他文件，这通常不是我们需要的。

既然 Xcode 提供的不好用，不如让我们自己来做一个吧。编写简单的 `bash` 代码，利用简单的正则匹配，我们可以找到需要打开的工程文件。

```shell
oop() {
    file=$(find -E . -regex ".*xcworkspace" -maxdepth 1)
    fileLength=${#file}
    if [ "$fileLength" = 0 ]; then
        file=$(find -E . -regex ".*xcodeproj" -maxdepth 1)
    fi
    fileLength=${#file}

    if [ "$fileLength" = 0 ]; then
        echo ">>> 🤔  No Xcode Project Found!"
    else
        echo ">>> 💪  Opening $file"
        xcode=$(xcode-select -p)
        xcode=$(echo $xcode | cut -d'/' -f-3)
        open -a $xcode $file
    fi
```

> 习惯使用 AppCode 的话，可以把 Bash 代码中的 Xcode 替换为 AppCode。

同样的这份代码需要放到 `.zshrc`  / `.bashrc` 下，改动之后需要 `source .zshrc/.bashrc` 让改动生效。

对于非 Xcode 工程，我习惯用 VSCode 编辑，它是如此常用，以至于我也为它设了一个别名：

```shell
alias c='code .'
```

## 提交代码

在每一个使用类 git-flow 开发流程的团队中，同步 `dev` 代码几乎是每日的例行公事。我们可以简单的将一些命令封装成一个 function：

```shell
syncdev() {
    git stash

    echo ">>> Updating dev"
    git checkout dev
    git pull origin dev

    echo ">>> Applying diff"
    git co -
    git rebase dev

    git stash pop
}
```

## 更快的 "Gitlab"

使用 [`lab`](https://github.com/zaquestion/lab)，我们可以在命令行直接完成一些常规的 Gitlab 操作。

使用 `brew` 可以安装 `lab`:

```shell
$ brew install zaquestion/tap/lab
```

第一次使用 `lab`，需要输入一些 gitlab 的信息。

### 创建 MR

使用 lab，我们可以直接创建 MR：

```shell
$ lab mr create origin $branch -a $assigne -m $message1 -m $mesasge2
```

对于大部分的提交，MR 的第一行 Message （即 Title）可以简化为最近一次的 Commit Message。而对于有 Code Review 合码机制的团队，message 的第二行通常是需要进行 Review 的同事，因此我们的命令可以简化成：

```shell
# mmr $branch $reviewer
mmr () {
    latestMessage=$(git log -1 --pretty=%B)
    lab mr create origin $1 -a $2 -m $latestMessage -m $2
}
```

经过这轮简化，创建一个 MR 只需：

```shell
mmr dev @someone
```

你会爱上这种过感觉！

## dotfiles

当习惯在命令行进行各种操作之后，我们会沉淀下很多有用的函数／别名／配置，这通常是开始构建自己的 dotfiles 的时候了，具体可以参考  [dotfiles](https://github.com/mathiasbynens/dotfiles)。dotfiles 帮助我们管理这些文件，作为一个 bouns point，我们可以在多个设备上"同步" dotfiles 了。

## 总结

本文总结了我在日常开发中使用命令行的一些经验，希望对其他同学有所帮助，也欢迎同学们交流。

每种工具都有长短，命令行长在执行一些操作，而 GUI 长在界面查看（如对比 Diff），没有必要局限于某种工具。重要是的 Picking the right tool for the job。