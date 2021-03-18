---
title: 在 Ubuntu 18.04 中使用 Netplan 配置网络
date: 2021-02-03 09:50:0
category: Tech
tags:
  - Ubuntu
  - Netplan
index_img: /img/posts/RWv3yF.png
toc: true
---

在 Ubuntu 升级到 18.04 之后（准确的是在 Ubuntu 17.10 以后），原先管理网络配置的 ifupdown 被替换成了 Netplan ，这使得之前的一些配置无法直接搬到新的系统中继续使用，所以来学习一下这个新工具，Netplan 。

<!-- more -->

# 什么是 Netplan

Netplan 是 Canonical 推出的一款抽象网络配置生成器，可以通过一个或多个 yaml 格式的配置文件，生成所需的网络配置，并应用到系统中。用户只需要在配置文件中描述好每个网络接口的各种参数属性，即可生成适用于 NetworkManager （一般用于桌面环境）或 Systemd-networkd （一般用于服务器环境）的网络配置。我对它的理解就是，你对于计算机网络的规划，你希望计算机的网络是什么样的，你就怎么写配置文件，它就按照你的配置文件帮你生成网络配置文件，是非常简单明了的工具。

它的工作原理如下：

<div align=center> <img src="/img/posts/KCBbfo.png"> <br > Netplan 工作原理</div>

# 为什么要 Netplan

在 Netplan 没有出来之前，Ubuntu 的网络配置一直是 ifupdown 管理，配置文件冗长，可读性不高，甚至有一些是无法用配置文件进行描述的。

```
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto ens3
iface ens3 inet static
        address 192.168.1.2
        netmask 255.255.255.0
        gateway 192.168.1.1
        dns-nameservers 8.8.8.8 8.8.4.4
```

而且，ifupdown 的配置文件并不能跨设备通用，每个设备的网卡信息都是固定的。在批量部署设备网络时，Netplan 拥有的 match 功能显然更胜一筹，用户可以通过名称、MAC 地址或者是内核驱动名称来匹配网络接口，从而实现用一份配置文件来配置多个设备的网络。

除此之外，Netplan 不会在引导期间进行过多的配置操作，再也不会因为开机等待 DHCP 而卡住等半天了，一些没有被配置文件涵盖的设备也不会被触发，所有的配置都是在开机的时候读取配置文件生成的，只加载必要的部分，大大提高了开机的效率。

说了这么多，让我们开始 Netplan 的配置吧。

# Netplan 配置文件

Netplan 的配置文件存放于三个不同的位置分别是 `/run/netplan/` ，`/etc/netplan/` 和 `/lib/netplan/` ，我们修改的是 `/etc/netplan/` 目录下的配置文件，其他两个目录会在配置生效的时候自动同步配置。你可以在配置文件目录下存放多个 yaml 文件，它们会被按照字母顺序加载，并且同名值会被后加载的覆盖。

## 基础配置文件

下面是一个基础的配置文件，这份配置文件会 NetworkManager 接管所有的网络设备，并所有以太网设备启用默认 DHCP（如果找到 DHCP 服务器的话）。如果将 `renderer` 改为 Systemd-networkd 的话，则不会启用 DHCP ，需要在配置文件指定设备才会启用。

编写配置文件的时候，缩进时要使用空格，不可使用 Tab 来缩进，空格数量不做要求，但是每一层级前面的空格数量必须相同，否则会导致配置文件读取错误。

```yaml
network:
  version: 2
  renderer: network-manager
```

显然，这样一份配置文件是不够的，我们需要更加详细的配置文件来适应各种需求。

## 为指定设备启用 DHCP

为网卡 enp3s0 启用 IPv4 的 DHCP 并禁用 IPv6 的 DHCP 。

```yaml
network:
  version: 2
  renderer: network-manager
  ethernets:
    enp3s0:
      dhcp4: true
      dhcp6: false
```

## 为指定设备配置静态 IP

这里我们来为网卡 enp3s0 设置一个静态的内网 IP ：

```yaml
network:
  version: 2
  renderer: network-manager
  ethernets:
    enp3s0:
      addresses:
        - 192.168.1.101/24
      gateway4: 192.168.1.1 
      nameservers:
        addresses:
          - 119.29.29.29
          - 119.28.28.28
          # [119.29.29.29, 119.28.28.28]
```

在书写这份文件的时候要注意：

- 原本的 IP 地址和子网掩码被合二为一成为这里的 addresses ，使用的是 CIDR 表示法，而且这里是复数形式，也就是说，可以在这里写多个地址，不区分 IPv4 和 IPv6 。
- 网关这里使用的是 IPv4 的网关，所以名称为 gateway4 ，如果要使用 IPv6 ，则应该另起一行再写一个 gateway6 ，并设置好 IPv6 的 IP 地址。
- nameservers 中的地址 addresses 我使用了两种写法，一种是列表的写法，一种是括号的写法，两种写法是等价的。

## 配置无线网卡设备

在给树莓派等设备配置网络的时候，经常会要连接 Wi-Fi ，如果有图形界面还比较简单，要是没有图形界面，可能有时候就没那么方便了。但是用 Netplan 的话，一切都很方便。下面就是一个简单的无线网络配置文件，你甚至不用声明是 WAP 认证方式：

```yaml
network:
  version: 2
  renderer: network-manager
  wifis:
    wlp1s0:
      dhcp4: yes
      access-points:
        "AccessPoint1": # SSID
          password: "**********"
        "AccessPoint2":
          password: "**********"
```

如果你用的是 WAP with EAP 等比较复杂的认证方式，用 Netplan 也可以轻松解决：

```yaml
network:
  version: 2
  renderer: network-manager
  wifis:
    wlp1s0:
      dhcp4: yes
        access-points:
          "AccessPointWithEAP":
            auth:
              key-management: eap # 管理系统
              method: ttls # 认证模式
              anonymous-identity: "@example.com"
              identity: "example@example.com"
              password: "*********"
```

## 多路网卡配置

假如你的电脑有两个网卡，同时接入了两个不同的 DHCP 网络，你可以设置优先级来让系统自动选择网络：（在这里 `enfirst` 比 `ensecond` 有着更高的优先级）

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enfirst:
      dhcp4: yes
      dhcp4-overrides:
        route-metric: 100 # 优先级为 100
    ensecond:
      dhcp4: yes
      dhcp4-overrides:
        route-metric: 200 # 优先级为 200
```

除了上述这些简单常见的配置，Netplan 还支持网桥、调制解码器（Modems）、隧道、VLAN 等等设备的配置，更多的配置请参阅官网的文档。

# 应用 Netplan 配置

在编写完成配置文件后，我们可以在终端执行指令 `generate` 来生成配置文件：

```Bash
sudo netplan generate
```

然后使用 `apply` 来应用生成的配置文件，必要时它会重启对应的网络服务：

```Bash
sudo netplan apply
```

也可以使用 `try` 来测试生成的配置文件，如果失败了，则会自动回滚到上一次的配置文件，成功则可以按 Enter 应用配置文件：

```Bash
sudo netplan try
```

# 总结

Netplan 作为新的网络配置生成器，配置文件简单，可用性高，操作方便，而且带有试错机会，可以说再也不用担心配不好 Linux 服务器的网络啦。建议大家都用一用，体验一下这种新鲜的配网方式。更多的用法就请看 Netplan 的官网啦：[https://netplan.io](https://netplan.io)