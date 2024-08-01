---
layout: post
title: 请使用performance.now()而不是new Date().getTime()
category: Web
date: 2024-08-01 15.50.00.000000000 +08:00
---

我们经常会遇到这样的需求，即比较两个时间点的时间差，大多数同学都会使用使用以下方法：

```javascript
const time1 = new Date().getTime();
doSomething();
const time2 = new Date().getTime();
console.log('doSomething一共花费的时间为:', time2 - time1);
```

一般来说，这样做是不会出现什么问题的，但是假如`doSomething()`函数执行时间非常长，那么就会出现异常。  
考虑以下场景:

> 当在执行`doSomething()`函数时，我手动或者系统NTP软件把系统时间修改了，那么`time2`和`time1`之间的差值就会变得不准确。

所以`new Date()`这个函数是不可靠的，它受系统时间影响较大。因此我们需要另寻他法。幸运的是，WEB
API给我们提供了`performance.now()`这个函数。  
`performance.now()`表示从页面加载到当前时间点所经常过的毫秒数。它是以一个恒定的速率慢慢增加的，不会受系统时间影响。
因此我们可以用这个函数来解决上面的需求。代码如下：

```javascript
const time1 = performance.now();
doSomething();
const time2 = performance.now();
console.log('doSomething一共花费的时间为:', time2 - time1);
```

这样我们就解决了时间间隔不准确的问题。但是`performance.now()`
这个函数为了安全性考虑，它也不是百分百精确的。但对于日常场景，已经够用了。  
相关文献请参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now)