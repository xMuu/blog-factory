---
title: 安装 Arch Linux 后的一点微小的工作
date: 2019-12-30 15:57:00
category: Tech
tags:
- Arch Linux
- Tweaks
toc: true
---

记录一下安装 Arch 之后一些需要的操作。

<!--more-->

## 开机前禁用 N 卡开源驱动并用 bbswitch 禁用 N 卡

> Fxxk NVIDIA～（

这一步是解决一些机子开机卡住的问题，并关闭 N 卡提高使用体验（解决发热 & 提高续航）。

 - 首先禁用 nouveau 驱动
    `sudo nano /etc/modprobe.d/blacklist-nouveau.conf`
    输入 `blacklist nouveau` 并保存
 - 安装 bbswtich 
    `sudo pacman -S bbswitch`
 - 接着新建配置文件 `/etc/modprobe.d/bbswitch.conf` 
    `sudo nano /etc/modprobe.d/bbswitch.conf`
    写入 `options bbswitch load_state=0` 并保存
 - 再新建一个配置文件 `/etc/modules-load.d/bbswitch.conf` 
    `sudo nano /etc/modules-load.d/bbswitch.conf`
    写入 `bbswitch` 并保存

这样开机就会加载 bbswitch 模块并关闭 N 卡了。


## 安装 zsh 

 - `sudo pacman -S zsh` 
 > oh-my-zsh 用脚本装可以直接获取更新不用等打包。
    添加用户的时候加上参数 `-s /bin/zsh` 即可将默认 shell 设置为 zsh 。


## 配置国内镜像源和第三方仓库

- 编辑 `/etc/pacman.conf` 
   `sudo nano /etc/pacman.conf`
- Misc options 中取消 `Color` ， `TotalDownload` ， `VerbosePkgLists` 的注释
- 取消下方 `multilib` 的两行注释，注意不是 `testing` 那两行
- 在文件的最下方添加 
    ```
    [archlinuxcn]
    Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
   
    [arch4edu]
    Server = https://mirrors.tuna.tsinghua.edu.cn/arch4edu/$arch
    ```
- 保存后执行 `sudo pacman -Syy` 更新软件源数据库即可

> archlinuxcn : Arch Linux CN 源，作为官方社区源的补充，上面有很多官方源没有的软件包，还有些国内特色的包。
> arch4edu : 面向高校用户推出的非官方软件仓库，主要包含高校用户常用的科研、教学及开发软件。


## 安装桌面环境以及一些其他东西

> 我是坚定的 KDE 党！（

`sudo pacman -S plasma konsole dolphin` # 如果有选项记得选 vlc
`sudo pacman -Rcun discover` # 删除自带的商店，不删也行，但是这东西真的没啥用
`sudo pacman -S pulseaudio-bluetooth alsa-plugins alsa-utils`
`sudo systemctl enable sddm`
`sudo systemctl enable NetworkManager`


## 配置中文字体

中文字体我选择了 Apple 的苹方字体（中文）搭配 SF-Pro （西文）这套解决方案。具体可以看[这个](https://github.com/xMuu/arch-kde-fontconfig)。


## 设置系统为中文

 - 先编辑配置文件 `/etc/locale.conf` 
    `sudo nano /etc/locale.gen`
 - 取消掉 `en_GB.UTF-8`， `en_US.UTF-8`， `zh_CN.UTF-8` 的注释
 - 执行 `sudo locale-gen`
 - 编辑 `/etc/locale.conf`
    `sudo nano /etc/locale.conf`
 - 添加下面内容并保存
    ```
    LC_TIME=en_GB.UTF-8
    LC_COLLATE=C
    ```
 - 在 KDE 中设置语言为中文，退出登陆后重启即可


## 安装输入法

 - 输入法这里选择 fcitx5 ，因为对 KDE 友好，而且也足够好用
    `sudo pacman -S fcitx5-git fcitx5-gtk-git fcitx5-qt5-git fcitx5-chinese-addons-git kcm-fcitx5-git`
    这里安装的都是 CN 源上的版本，因为更新的比较快，功能齐全。最后一个 `kcm-fcitx5-git` 是在 KDE 上的输入法配置面板。
 - 编辑 `~/.pam_environment`
    `nano ~/.pam_environment`
 - 添加下面内容并保存
    ```
    GTK_IM_MODULE=fcitx5
    QT_IM_MODULE=fcitx5
    XMODIFIERS=@im=fcitx5
    ```
 - 安装完成后在 KDE 的系统设置里面，区域设置，输入法，添加 `pinyin` 到左边然后应用，就能使用拼音了，当然了还有五笔等一些输入方式，可以自己选


## 配置 Intel 核显 VA-API 以及 Chromium 的硬件加速

通过配置硬件加速，可以获得不错的浏览体验以及视频体验。

 - 先安装相应的驱动：
    `pacman -S vulkan-intel intel-media-driver libva-utils`
 - 编辑 `~/.pam_environment`
    `nano ~/.pam_environment`
 - 写入以下内容并保存。
    ```
        LIBVA_DRIVER_NAME=iHD
    ```
 - 退出登陆后重新登陆，运行 `vainfo` ，如果没错误的话，应该会有这样的输出：
    ```
    vainfo: VA-API version: 1.6 (libva 2.5.0)
    vainfo: Driver version: Intel iHD driver - 1.0.0 vainfo: Supported
    profile and entrypoints
    ......
    ```

接下来就开始安装 Chromiun 并启用一些参数使得硬件加速全开。

 - 安装支持硬件加速版本的 Chromiun 
    `pacman -S chromium-vaapi`
    这个为 AUR 包，但是在 Arch Linux CN 源有已经编译打包好的，直接安装 CN 源上的就好了。
 - 新建配置文件 `~/.config/chromium-flags.conf` ：
    `nano ~/.config/chromium-flags.conf`
 - 写入 `--ignore-gpu-blacklist` 并保存退出。（如果原来这个文件存在要确定不能有 `--use-gl=egl` 这个参数）
 - 打开 Chromium 并打开 [`about://flags`](about://flags) 。
 - 搜索并启用 `GPU rasterization` ， `Out of process rasterization` ， `Zero-copy rasterizer` ， `Viz Hit-test SurfaceLayer` ， `Skia API for OOP-D compositing` （如果找不到则忽略，可能被更新加入了）
    打开 `about://gpu` 如果看到以下输出，则说明配置完成
    ```
    Graphics Feature Status
    Canvas: Hardware accelerated
    Flash: Hardware accelerated
    Flash Stage3D: Hardware accelerated
    Flash Stage3D Baseline profile: Hardware accelerated
    Compositing: Hardware accelerated
    Multiple Raster Threads: Enabled
    Out-of-process Rasterization: Hardware accelerated
    Hardware Protected Video Decode: Hardware accelerated
    Rasterization: Hardware accelerated
    Skia Renderer: Enabled
    Video Decode: Hardware accelerated
    Viz Display Compositor: Enabled
    Viz Hit-test Surface Layer: Enabled
    Vulkan: Disabled
    WebGL: Hardware accelerated
    WebGL2: Hardware accelerated
    ```

## 切换 IO 调度器（可选）

 - 新建文件 `/etc/udev/rules.d/60-ioschedulers.rules`
    `sudo nano /etc/udev/rules.d/60-ioschedulers.rules`
 - 写入下面内容并保存。
    ```
    ACTION=="add|change", KERNEL=="sd[a-z]|mmcblk[0-9]*", ATTR{queue/rotational}=="0", ATTR{queue/scheduler}="mq-deadline"
    ACTION=="add|change", KERNEL=="sd[a-z]", ATTR{queue/rotational}=="1", ATTR{queue/scheduler}="bfq"
    ```


## 开启 SSD Trim

 - `sudo systemctl enable fstrim.timer`


----

**~大概就想到这么多，其他的以后补上。~**

## 后记

  换了 macOS(Hackintosh) 了，真香！