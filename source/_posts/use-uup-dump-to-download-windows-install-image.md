---
title: 【旧文迁移】利用 UUP Dump 下载 Windows 镜像
date: 2020-01-27 22:30:00
tags:
- Windows
- 安利
---

最近被安利回 Windows ，感觉还是不错的。
在回来的路上，兔子推荐了 [UUP Dump](https://uupdump.ml/) 这个网站，可以很方便地下载 Windows 镜像（Insider 版本），感觉还是不错的，比从微软官方下载或者 itellyou 上的 ed2k 都要方便很多。写一点推荐一下。

打开网站就可以看到很多版本的 Windows 镜像，也可以通过搜索来获取指定版本的镜像。（可能需要手动设置一下才会显示中文）

<img src="https://i.loli.net/2020/01/27/drp9gMDOofXkHNF.png" >

以搜索 19041.21 这个版本为例，我们可以看到搜索出来了这些结果，分别对应了桌面版、服务器、不同架构的镜像。一般选择 Windows 开头的 Insider 版本即可。

<img src="https://i.loli.net/2020/01/27/cdsqSONruaQnKRB.png" >

接下来就是对镜像的内容进行一些设置，比如语言、系统版本、集成内容等。语言选中文就可以啦。然后版本的话，没有特殊需要的话直接选单个的 Pro 就好啦，可以缩小镜像的大小。在第三个设置页面里，先选择第三个下载方式，可以增加一些其他版本的安装选项和一些附加内容，比如企业版、教育版、专业工作站版， .Net 3.5 框架等等，我一般会选择安装企业版，因为可以关闭的选项会比其他的版本多。

<img src="https://i.loli.net/2020/01/27/TwQ7nAV6uqiP3vr.png" >

<img src="https://i.loli.net/2020/01/27/DPCSOiM8qLJarju.png" >

<img src="https://i.loli.net/2020/01/27/uMA6DQVm3KaOt8H.png" >

设置完成后，会下载一个压缩包，里面包含了刚才所选的配置和下载工具，以及下载脚本（bat 和 sh 两种格式），这个脚本会下载需要的文件然后合成一个 ISO 文件，这个文件就是 Windows 的安装镜像了，挂载提取到 FAT32 格式的 U 盘中，通过 U 盘启动就可以开始安装系统了。

<img src="https://i.loli.net/2020/01/27/Y3CsFRq1vJphlc9.png" >

> 注：在 Linux/macOS 环境下可能会缺失一些工具，需要手动安装。
