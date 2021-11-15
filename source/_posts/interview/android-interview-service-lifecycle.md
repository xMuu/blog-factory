---
title: 【Android 补补高】startService() 还是 bindService() ？
date: 2021-11-15 15:58:19
tags:
- Android
- Service
---

经典问题：启动 Service 的时候， `startService()` 和 `bindService()` 有什么不同？你能讲讲吗？

<!--more-->

Android 官方提供了两种方式来创建服务，一个是 `startService()` ，另一个是 `bindService()`，这两种方法创建的服务，其执行的相关方法是不同的，返回的结果也不同。首先我们先来了解一下都有哪些方法会在创建服务的时候被调用。

# Service 会自动调用的方法

## onCreate()
`onCreate()` 方法是系统调用的第一个方法，用于做一些 Service 的初始化工作。该方法只会被调用一次，并且是在 `onStartCommnad()` 和 `onBind()` 之前。假如服务已经在运行了，那么该方法是不会再被调用的。

## onStartCommand()
`onStartCommand()` 方法会在其他组件（比如 Activity ）调用了 startService() 方法后被调用。这个方法意味着服务已经启动了，并且将会在后台一直运行，直到调用 stopService() 方法或者系统停止服务。该方法会返回一个 int 类型的值，告诉系统应该如何对待该服务的状态。

## onBind()
`onBind()` 方法会在其他组件想要和服务进行绑定的时候被调用，也就是其他组件调用 bindService() 方法的时候。该方法会返回一个 IBinder 类型的对象，这个对象可以用来进行服务和组件之间的通信。假如你不想你的服务被绑定，那么返回 `null` 就行了。

## onDestroy()
系统在不再使用服务并销毁服务时会调用此方法。这是服务接收到的最后一个调用，所有跟资源释放等一些最后的收尾工作应该放在此方法中。


# 开发者可以调用的方法

## startService()
该方法的作用是启动服务，会自动调用 `onCreate()` 和 `onStartCommand()` 。反复调用该方法时，此处的 `onCreate()` 方法只会被调用一次，而 `onStartCommand()` 方法可以被调用多次。

## stopService()
该方法是用于关闭服务，调用该方法后，系统会调用 Service 的 `onDestroy()` 方法。

## bindService()
调用该方法可以绑定服务到当前组件，调用方法 `onCreate()` 和 `onBind()` ，反复调用 `bindService()` 时，自动调用两个方法都只会被调用一次。

## unbindService()
该方法是用来解绑服务的，当所有的客户端都调用这个方法后之后会自动调用 `onUnbind()` 方法。

# 官方提供的生命周期图
![官方提供的生命周期图](/img/posts/0edc8208-bb42-456c-81cf-5f7a582329cf.png)

# 自己绘制的生命周期图
TODO