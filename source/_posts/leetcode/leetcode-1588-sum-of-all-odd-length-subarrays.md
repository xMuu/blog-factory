---
title: 【咕咕一题】所有奇数长度子数组的和
date: 2021-08-29 15:36:00
category: LeetCode
tags:
  - LeetCode
  - Easy
  - Array
  - Prefix Sum
toc: true
---

> 原题链接： [1588. 所有奇数长度子数组的和 - 力扣（LeetCode）](https://leetcode-cn.com/problems/sum-of-all-odd-length-subarrays/)


## 题目

给你一个正整数数组 `arr` ，请你计算所有可能的奇数长度子数组的和。

子数组 定义为原数组中的一个连续子序列。

请你返回 `arr` 中所有奇数长度子数组的和。

## 示例

```
输入：
    arr = [1,4,2,5,3]
输出：
    58
解释：
    所有奇数长度子数组和它们的和为：
    [1] = 1
    [4] = 4
    [2] = 2
    [5] = 5
    [3] = 3
    [1,4,2] = 7
    [4,2,5] = 11
    [2,5,3] = 10
    [1,4,2,5,3] = 15
    我们将所有值求和得到 1 + 4 + 2 + 5 + 3 + 7 + 11 + 10 + 15 = 58

输入：
    arr = [1,2]
输出：
    3
解释：
    总共只有 2 个长度为奇数的子数组，[1] 和 [2]。它们的和为 3 。

输入：
    arr = [10,11,12]
输出：
    66
```


## 题解

### 1. 暴力破解

拿到题的第一反应还是暴力破解之，毕竟是简单题，而且计算思路很明确，计算出每个位置往后所有可能长度的子串和最后求和就是了。

``` Java 
class Solution {
    public int sumOddLengthSubarrays(int[] arr) {
        // 最终结果
        int result = 0;
        // 可能的子串长度的个数
        int count = arr.length % 2 == 0 ? arr.length / 2 : arr.length / 2 + 1;
        // 遍历获得每个长度的所有子串
        for (int i = 0; i < count; i++) {
            // 子串长度
            int length = i * 2 + 1;
            // 从头开始获取所有可能的子串
            for (int j = 0; j <= arr.length - length; j++) {
                result += getSubSum(arr, j, length);
            }
        }
        return result;
    }

    // 获取子串中的数字之和
    private int getSubSum(int[] arr, int start, int length) {
        int result = 0;
        for (int i = 0; i < length; i++) {
            result += arr[start + i];
        }
        return result;
    }
}
```

这样做起来的时间复杂度近似于 O(n^3) ，算是比较简单粗暴的做法，在题目给的数据比较小的情况下用还是没问题的，但是假如题目的给的数据再大一些就一定超时了。


### 2. 前缀和

通常的前缀和都是根据前面两个位置的结果来计算当前位置的结果，一开始思考感觉根本不可能算出来，觉得应该是要找到一个数字出现次数的规律来做。但是后面看了一下别人的题解，发现并不是利用前缀和的思想来获得答案，而是用前缀和来加速计算，达到优化的效果。

假设我们有三个坐标并且三个坐标的关系为： `a < b < c` 。

令 `|a - b|` 为坐标 `a` 和 `b` 之间所有数之和，则可以得到如下的一个算式：

`|b - c| = |a - c| - |a - b|`

其中 `|a - c|` 和 `|a - b|` 均为我们用前缀和计算出来的产物，于是乎可以写得：

``` Java
class Solution {
    public int sumOddLengthSubarrays(int[] arr) {
        // 最终结果
        int result = 0;
        // 存放前缀和的结果
        int[] preSum = new int[arr.length + 1];
        preSum[0] = 0;
        // 计算前缀和
        for (int i = 0; i < arr.length; i++) {
            preSum[i + 1] = preSum[i] + arr[i];
        }
        // 可能的子串长度的个数
        int count = arr.length % 2 == 0 ? arr.length - 1 : arr.length;
        // 计算每一个数字可能的情况
        for (int i = 1; i <= arr.length; i++) {
            // 多少个长度就计算多少次
            for (int j = 1; j <= count; j += 2) {
                // 判断前面是否够长，不够长就跳过
                if (i - j >= 0) {
                    result += preSum[i] - preSum[i - j];
                }
            }
        }
        return result;
    }
}
```

用前缀和的方法做完的时间复杂度近似于 O(n^2 + 1)（我也不知道能不能这样写，但是大概的情况就是这样吧），感觉还有优化的空间，我就又去看了一下题解。


### 插播广告

以下两个方法都会用到一个计算就是给定若干个数字，算出里面有多少长度为奇数/偶数的子串，给一个公式：

假设长度为 n ，则：

奇数长度子串个数 `odd_n = (n + 1) / 2`

偶数长度子串个数 `even_n = n / 2 + 1` （这里加一是把 0 也计算为偶数了）

### 3. 构造法

这个构造法的名字是我起的，因为这个做法就是在每个数字位置上，计算能够构造出多少个符合要求（长度为奇数）的子串，也就得到了每个数字出现的次数，只要将数字乘以次数后求和就是结果了。

接下来我们来研究如何构造出符合条件的子串。

假设我们有一个长度为 n 的数组，数组的坐标从 0 开始，任意取一个下标 x ，则在 x 前面，一共有 0, 1, 2 .. x-1 这些坐标，共计 `x - 1` 个数字，在 x 后面，则有 x+1, x+2, x+3 .. n - 1 这么些坐标，共计 `n - 1 - x` 个数字。

对于奇偶数相加，有这样一个规律，`奇数 + 奇数 = 偶数` ，`偶数 + 偶数 = 偶数` ，`偶数 + 奇数 = 奇数` 。

也即是说，我们基于 x 这一个数，如果要构造一个奇数长度的子串，那么我们需要保证前后的长度同为奇数或者同为偶数，这样就永远会有 `偶数 + 1 = 奇数` 的一个子串。当然了，也可以一边为 0 ，另外一边为偶数，所以这里会把 0 放到偶数中计算。

所以每个数字构造出的子串个数可以理解为：`前后长度均为奇数的情况数 + 前后长度均为偶数的情况数` 。而这个情况数就是一个组合结果，等于 `前边个数 * 后边个数` 。

说的有点绕了，简单的说，`总子串个数 = before_odd_length * after_odd_length + before_even_length * after_even_length`

这里的 before_odd_length 就是在 `x - 1` 个数字中奇数长度的连续字符串的个数，after_odd_length 则是 `n - 1 - x` 中的个数，偶数也一样。

在代码中我用左右来代替前后了，不过理解起来还是比较简单：

``` Java
class Solution {
    public int sumOddLengthSubarrays(int[] arr) {
        // 最终结果
        int result = 0;
        for (int i = 0; i < arr.length; i++) {
            int leftLength = i; // 左边可选的长度范围
            int rightLength = arr.length - i - 1; 
            int leftOdd = (leftLength + 1) / 2;// 左边长度为奇数的个数
            int leftEven = leftLength / 2 + 1; // 左边长度为偶数的个数，包括 0 
            int rightOdd = (rightLength + 1) / 2;
            int rightEven = rightLength / 2 + 1;
            result += (leftOdd * rightOdd + leftEven * rightEven) * arr[i];
        }
        return result;
    }
}
```

在这里就成功达到了时间复杂度 O(n) 的情况了！

### 4. 数字规律

这个规律也是用来获取出现次数的。

假设要求坐标 x 的数字出现的次数，则有次数 `time = show[x - 1] - end[x - 1] + start[x]` 。

其中 `show[x]` 表示坐标 x 的数字出现的次数，`end[x]` 表示子串以坐标 x 结尾的次数，`start[x]` 表示子串以 x 开始的次数。

因为假如 `x - 1` 的数字出现了，那么后面必定会跟着 `x` ，除非这个子串刚好在 `x - 1` 处结束。所以就有了 `show[x - 1] - end[x - 1]` ，`start[x]` 则是补充 x 开始的情况，这样就可以覆盖到所有出现的次数。

然后说说如何计算 `start` 和 `end` 。首先是 `start` ，根据后面有多长的字符串，可以直接算出来有多少个长度为奇数的子串，而 `end` 则是另外一个规律，即 `次数 = (坐标 + 1) / 2` 后取整，有点意思，可以自己去研究一下为啥。

最终的代码可以不存储前面其他数字的数据，只保留上一个数字的数据，非常简单。

``` Java
class Solution {
    public int sumOddLengthSubarrays(int[] arr) {
        int result = 0;
        int lastEnd = 0; // 以前一个结尾的次数
        int lastShow = 0; // 前一个数出现的次数
        int curStart = 0; // 以当前数字开头的次数
        for (int i = 0; i < arr.length; i++) {
            curStart = (arr.length - i + 1) / 2;
            lastEnd = (i + 1) / 2;
            lastShow = lastShow - lastEnd + curStart;
            result += arr[i] * lastShow;
        }
        return result;
    }
}
```

这个做法是我觉得最为巧妙的，能找到这个规律的人真的太强了，膜拜膜拜。

## 结果

![提交结果](/img/posts/er74fc.png)