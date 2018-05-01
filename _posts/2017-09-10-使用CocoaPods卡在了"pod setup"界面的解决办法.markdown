---
layout: post
title: 使用CocoaPods卡在了"pod setup"界面的解决办法
categories: iOS
date: 2017-09-10 08:35:24.000000000 +08:00
---
有时候，我们在执行`pod install`或`pod search`命令时，会在终端偶现卡在'pod setup'界面的情况，
其实，该情况也许并非真的卡住，下面给出两种解决方案。

方案1：

1. 在执行`pod install`命令时加上参数`--verbose`即:`pod install 'ThirdPartyName' --verbose`,可在终端详细显示安装信息，看到pod目前正在做什么(其实是在安装第三方库的索引)，确认是否是真的卡住。
2.进入终端家目录，输入`ls -a`可看到隐藏的pod文件夹，输入`cd .cocoapods`进入pod文件夹，然后输入`du -sh`即可看到repos文件夹的容量，隔几秒执行一下该命令，可看到repos的容量在不断增大，待容量增大至300+M时，说明，repos文件夹索引目录已安装完毕。此时，pod功能即可正常使用。


----------

方案2：

 1. 通过方案1，我们知道在pod setup过程中，pod其实是在安装第三方库的索引目录，因此我们可以直接从githups上下载索引目录拷进repos文件夹。
 2. 前往https://github.com/CocoaPods/Specs，下载该索引，然后拷进repos文件夹。目录结构如下图所示:![这里写图片描述](http://img.blog.csdn.net/20160719163514531)
 3.  完全退出终端，重启终端，pod功能即可正常使用。
 
另:安装cocoapods提示没有权限的解决办法如下(You don't have write permissions for the /usr/bin directory.):
执行该命令即可:
**`sudo gem install cocoapods -n /usr/local/bin`**