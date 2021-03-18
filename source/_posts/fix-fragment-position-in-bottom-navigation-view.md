---
title: 修复 Android Studio 自带的 BottomNavigationView 中 Fragment 位置错误
date: 2020-03-14 17:25:08
category: Android
tags:
- Android
- Java
- BottomNavigationView
- Fragment
index_img: /img/posts/ueTXKU.png
toc: true
---
最近在玩 Android Studio 里面的 BottomNavigationView ，在使用的时候发现了一点问题，自动创建的 Fragment 位置会偏下，研究了一下，找到了修复位置错误的办法。

<!--more-->

# TL; DR
- 删除 `activity_main.xml` 中的 `android:paddingTop="?attr/actionBarSize"` 属性
- 为 `activity_main.xml` 中的 `nav_host_fragment` 添加 `android:layout_marginBottom="?attr/actionBarSize"` 属性

# 发现问题

新建完 BottomNavigationView 后通过虚拟机启动，可以看到以下画面，没有别的元素时，不会发现问题。（其实如果眼尖一点，可以发现文字不是居中的。）

![初始效果](/img/posts/ueTXKU.png)

但是如果我们在任意一个 Fragment 里面创建一点内容，这里以一个带颜色的 View 和原本自带的文字为例，View 我设置宽高均匹配父元素，把文本放到了底部的位置，代码如下。

```
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".ui.home.HomeFragment">

    <View
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="@color/colorAccent" />
    
    <TextView
        android:id="@+id/text_home"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginStart="8dp"
        android:layout_marginTop="8dp"
        android:layout_marginEnd="8dp"
        android:textAlignment="center"
        android:textSize="20sp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"/>

</androidx.constraintlayout.widget.ConstraintLayout>
```

在编辑器里面预览的效果是这样：

![效果预览](/img/posts/uRZHe4.png)

现在，让我们再次启动程序，就会发现，View 的上方少了一块，本该在底部的文字也不见了。

![错误效果](/img/posts/FTBv2S.png)


# 排查问题

![位置错误](/img/posts/MWZ8hL.png)

可以看到，Fragment 的上方是没有跟父级元素贴合的，这个就导致了 Fragment 没有跟上方贴合。


# 解决问题

一番 Google 后并没找到什么别人的解决方案，就自己在项目里到处看，最后发现，在 `activity_main.xml` 中的外层框架，有个属性 `android:paddingTop="?attr/actionBarSize"` ，意思是在上方空出空间给 Action Bar ，而这个代码本身的 Action Bar 并不需要预留空间，所以去掉这个就好了。

现在的效果就是这样：

![错误一半效果](/img/posts/TN5WAX.png)

诶？文字呢？怎么文字还是看不到？

再回去编辑器里看，发现底部的导航栏其实是覆盖在 Fragment 上的，也就是说文字被这个挡住了，那再来一个 padding 吧，这次加给 Fragment 就好了， `android:layout_marginBottom="?attr/actionBarSize"` ，导航栏的高度是跟顶部 Action Bar 一样的。

这下子就没问题了：

![正确效果](/img/posts/GCOm1W.png)

以上就是修正 BottomNavigationView 中 Fragment 位置错误的完整过程啦，其实就是水博客。（