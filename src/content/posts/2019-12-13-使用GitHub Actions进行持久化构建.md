---
layout: post
title: 使用GitHub Actions进行持久化构建
category: Others
date: 2019-12-13 15:32:00.000000000 +08:00
---

日前Github新推出了一项功能Actions，可利用该功能进行持久化构建，该功能十分强大，我们可以利用它进行自动化测试、部署、持久化构建。
话不多说，我们来看一下具体怎么操作的吧？


首先当你将你的项目上传到GitHub上后，会发现有一个Actions的标签，如图所示：
![github actions](/assets/images/DB39C288-9A75-434F-9C13-0912CE603473.png)

然后我们点击这个标签 ，会看到一些推荐的工作流 ，可选的工作流还是挺多的，选择适合自己的工作流，由于我的项目是Vue，所以这里以NodeJS为例：
![nodejs workflow](/assets/images/689D200D-9E83-4678-834F-02930659CA22.png)

点击“Set up this workflow”
然后会让你编写你要构建的脚本，下面是我的项目的脚本：
![project script](/assets/images/39BC446F-8298-4468-A699-89FCC0F1AC03.png)
关于脚本语法，请参阅<https://help.github.com/cn/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions>

这是一个yml格式的文件，编写完成后，进行提交，然后GitHub就会触发构建，这次再去点击“Actions”标签，就可以查看构建状态，如图所示：
![github actions](/assets/images/F8503543535517294F8DEE5C3CEA9106.jpg)

待构建完成后，由于构建步骤中添加了上传构建包的action，会在该页面的右侧出现下载构建包的按钮，如图所示：
![github actions](/assets/images/08743D4E-F8B0-4484-9E0D-F0DD09D73595.png)
关于构建包更详细的说明，请参阅https://help.github.com/cn/actions/automating-your-workflow-with-github-actions/persisting-workflow-data-using-artifacts
