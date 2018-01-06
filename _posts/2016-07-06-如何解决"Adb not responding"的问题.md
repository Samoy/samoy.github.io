---
layout: post
title: 如何解决"Adb not responding"的问题
categories: Android
date: 2016-07-06 11:45:24.000000000 +08:00
---
<p>今天在写Demo的时候，发现程序包名不合适，就Rename了一下，然而却出现了题目中所提到的问题，Genymotion模拟器加载不出来，初步以为是模拟器路径不对，更改了一下路径，然而并没什么卵用。</p>
<p>重启了Android Studio后，初始化adb时，出现了"adb connection error"问题，方知是adb出现了问题。于是上网查了资料，进过研究，是由于其他程序占用了5037端口。将其杀死即可。</p>
具体解决方法如下:
1.关闭Android Studio;

2.打开终端，键入`sudo lsof -i |grep 5037`命令，查看哪些程序占用了5037端口，如下图所示:
![终端界面截图](http://img.blog.csdn.net/20160706114050836)

3.键入`sudo kill PID_NUMBER`命令杀死改程序。(PID_NUMBER是指程序的进程id,如上图的2043,2046,2048)。

4.重启Android Studio.

如下图所示，模拟器加载出现。可见，问题已解决。
![模拟器选择](http://img.blog.csdn.net/20160706114600908)