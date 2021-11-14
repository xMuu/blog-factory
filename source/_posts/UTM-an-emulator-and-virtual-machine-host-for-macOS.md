---
title: UTM ：又一款 macOS 上的虚拟机软件
date: 2021-11-14 11:10:00
category: Tech
tags: 
- macOS
- UTM
- Virtual Machine
toc: true
index_img: /img/posts/a1bfd7c4-2a33-45e9-b768-711c5c921be9.png
---

UTM 是 macOS 上的一款开源虚拟机软件，偶然发现的，还挺好用，各位可以试试。

<!--more-->

# 前情

最近有个课程需要装一个 CentOS 8 来做些东西，本着多一事不如少一事的原则，选择了用老师同版本 Linux 。碰巧我换了 M1 版本的 MBP ，就尝试了主流的 PD 和 VMware Fusion ，结果都无法启动 CentOS 8 ，后面搜索发现说是因为 pagesize 的问题导致系统无法启动，然后又发现有个人说用 UTM 可以启动 CentOS 7 ，于是抱着试试的心态，我成功地在 MBP 上用 UTM 运行了 CentOS 8 的 ARM 版本。

# 什么是 UTM
UTM 原本是一个在 iOS 上运行虚拟机的 App ，支持模拟众多的处理器类型，也有相关的一些硬件参数可选。之前在 iOS 设备上模拟运行 Android 的也是通过这款软件实现的。
从 M1 发布后，UTM 也开始适配 M1 处理器，发展成为 macOS 上的一个虚拟机软件。UTM 的底层其实是 qemu ，具体的一些细节可以去他们的官网查看，这里就不过多赘述了。

![UTM 官网](/img/posts/60f4e7d4-039d-4b69-9e12-856a17308b32.png)

# 下载 UTM

在搜素引擎上直接搜索 UTM 很容易到的是 iOS 版本的 UTM ，而且 iOS 的网页上也没有任何通往 Mac 版的连接，所以要加个关键字 `Mac` 才能找到 Mac 版的官网，或者从我这里进入官网：[UTM Mac 版本官网](https://mac.getutm.app) 。

哦，你也可以在 App Store 获取下载，不过我不知道这两个版本是否会有所差别，所以我还是推荐下载官网的。

# 使用 UTM

打开 UTM 之后，首先推荐去 Preferences 里面开启 “Force slower emulation even when hypervisor is available” ，这个是强制使用慢速模拟选项，可以增强虚拟机的兼容性，也是因为有这个选项，UTM 才能运行其他虚拟机软件无法运行的系统。

![Force slower emulation even when hypervisor is available](/img/posts/89703709-45f2-4286-a10c-b886d5cc608a.png)

在首页点击“新建”按钮，输入虚拟机名称啥的，然后在 “System” 页面选择你想要虚拟机的架构类型，我使用的都是 ARM64 的 Linux ，所以我在这选择 Architecture 为 “ARM64 (aarch64)” ，其他的保持默认即可，当然你有需求也可以根据你的需求来修改。

后面就是改内存大小，设定硬盘什么的，都大同小异，提一个比较特别的就是 ISO 文件需要在 “Drives” 里面用 “Import Drive” 按钮来导入，而不是创建完 Drive 再设定。

![虚拟机设置](/img/posts/8426153c-b780-414b-acef-e4de762f1a67.png)

# 推荐 UTM ！

首先当然是因为 UTM 能解决我的需求，运行 CentOS 8 ，再就是我在使用过程中发现了这个：

![Display](/img/posts/dff06abf-fb18-4539-93a6-acb23cd340c1.png)

Display 里面有一个 “Console Only” 的选项，可以让虚拟机以文本方式输出，而不是图形化的，这样不仅能解决性能问题，而且还能直接复制虚拟机里面的内容，非常方便！我之前没调整这里，在切换窗口的时候总能感觉到一些延迟，但是打开 “Console Only” 之后就没有感觉了。

![Console Only](/img/posts/4e972a3e-429a-48db-99d9-8a4c547182c9.png)

最后就是 UTM 是一个开源免费的项目，钱包不会空空了，非常棒！虚拟机在运行的时候机器也非常凉爽，风扇都不带转一下，其他同学的笔记本都快起飞了我还纹丝不动，强烈推荐 M1 或者其他处理器的同学试试这个！