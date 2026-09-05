---
layout: post
title: 别再死记 flex: 1 了：从空间分配彻底搞懂 Flex
category: 前端
date: 2026-09-05 12:00:00 +08:00
keywords: CSS, Flex, flex-grow, flex-shrink, flex-basis, flex:1, flex:auto
excerpt: flex-grow、flex-shrink、flex-basis 到底有什么区别？为什么 flex: 1 和 flex: auto 表现不同？这篇文章不背结论，而是从“浏览器如何分配空间”出发，把 Flex 的核心逻辑串起来。
---

前端开发中，`display: flex` 几乎已经成为最常用的 CSS 布局方式之一。

但有一个很有意思的现象：很多工作了几年的前端开发，甚至每天都在使用 Flex 的人，遇到下面三个属性时依然容易混淆：

```css
flex-grow
flex-shrink
flex-basis
```

更典型的是：

```css
flex: 1;
```

和：

```css
flex: auto;
```

到底有什么区别？

很多时候我们会直接记住一句话：

> `flex: 1` 就是平均分配。

这句话在很多简单场景下确实“看起来是对的”，但它没有解释 **为什么**。

而一旦布局稍微复杂一点，比如子元素本身有宽度、内容长度不同，或者容器空间不足，就会发现 Flex 并没有想象中那么简单。

其实理解 Flex 的关键并不在于死记三个属性，而在于把它看成一个 **空间分配问题**：

> **先确定每个 Flex Item 的基础尺寸，再计算容器剩余多少空间，最后决定这些空间应该增长还是收缩。**

---

## 一、先把 Flex 想成“分配空间”

假设有一个 600px 宽的容器：

```css
.container {
  width: 600px;
  display: flex;
}
```

里面有三个元素：

```text
┌──────────────────────────────────────────┐
│                                          │
│      A             B             C       │
│                                          │
└──────────────────────────────────────────┘
                    600px
```

浏览器并不是简单地看到“三个元素”，然后直接做：

```text
600 ÷ 3 = 200px
```

它首先需要回答一个问题：

> **每个元素本来应该有多大？**

这个“基础尺寸”就是 Flex 中非常重要的概念：**Flex Base Size**。

而 `flex-basis` 正是影响这个基础尺寸的属性。

之后浏览器再计算：

```text
容器空间 - 所有 Item 的基础尺寸
```

结果可能是两种情况：

```text
剩余空间 > 0
    ↓
flex-grow
    ↓
把多出来的空间分出去
```

或者：

```text
剩余空间 < 0
    ↓
flex-shrink
    ↓
把超出的空间“削掉”
```

所以可以先记住这句话：

> **`flex-basis` 决定从哪里开始算，`flex-grow` 决定多出来的怎么分，`flex-shrink` 决定不够的时候怎么缩。**

---

## 二、flex-basis：我本来想要多大？

最简单的情况：

```css
.item {
  flex-basis: 200px;
}
```

可以把它理解成：

> **在 Flex 主轴方向上，我的基础尺寸是 200px。**

例如：

```css
.container {
  width: 600px;
  display: flex;
}

.item {
  flex-basis: 200px;
}
```

三个元素的基础尺寸就是：

```text
A = 200px
B = 200px
C = 200px

总计 = 600px
```

刚好填满。

如果容器改成 800px：

```text
A = 200px
B = 200px
C = 200px

已经使用 = 600px

剩余 = 200px
```

这时候就轮到 `flex-grow` 出场了。

---

## 三、flex-grow：有多余空间，怎么分？

假设：

```css
.container {
  width: 800px;
  display: flex;
}

.item {
  flex-basis: 200px;
}
```

三个元素先占：

```text
200 + 200 + 200 = 600px
```

容器有 800px，所以剩余：

```text
800 - 600 = 200px
```

如果三个元素：

```css
.a { flex-grow: 1; }
.b { flex-grow: 1; }
.c { flex-grow: 1; }
```

那么 200px 按照：

```text
1 : 1 : 1
```

分配。

最终大约：

```text
A = 266.67px
B = 266.67px
C = 266.67px
```

如果改成：

```css
.a { flex-grow: 1; }
.b { flex-grow: 2; }
.c { flex-grow: 3; }
```

那么剩余空间按照：

```text
1 : 2 : 3
```

分配。

因此 `flex-grow` 真正表达的不是：

> “我的宽度是多少。”

而是：

> **“如果还有剩余空间，我按照多大的比例参与分配。”**

可以把它理解成：

> **有多出来的蛋糕，我按照我的份额多拿一点。**

---

## 四、flex-shrink：空间不够，怎么缩？

`flex-grow` 解决的是“空间多了怎么办”，`flex-shrink` 解决的则是“空间不够怎么办”。

例如：

```css
.container {
  width: 500px;
  display: flex;
}

.item {
  flex-basis: 200px;
}
```

三个元素的基础尺寸总和：

```text
200 + 200 + 200 = 600px
```

但是容器只有 500px。

也就是说：

```text
600 - 500 = 100px
```

必须想办法缩掉 100px。

如果三个元素都是：

```css
flex-shrink: 1;
```

它们会参与这次收缩。

在基础尺寸相同的情况下，最终大约是：

```text
A = 166.67px
B = 166.67px
C = 166.67px
```

这里有一个很容易被忽略的细节：

> **`flex-shrink` 不是简单地说“数值越大，就直接缩多少像素”。**

实际的收缩计算还会考虑 Flex Item 的基础尺寸。

可以粗略理解为收缩权重与下面这个量有关：

```text
flex-shrink × flex-basis
```

例如：

```css
.a {
  flex-basis: 100px;
  flex-shrink: 1;
}

.b {
  flex-basis: 300px;
  flex-shrink: 1;
}
```

如果两者共同面对空间不足，那么 B 的基础尺寸更大，因此它承担的收缩量也会更大。

所以：

> **`flex-shrink` 更准确地说是“空间不足时的收缩因子”，而不是一个直接的缩小像素值。**

---

## 五、三个属性放在一起就清楚了

到这里可以把三个属性串起来：

| 属性 | 解决什么问题 | 可以理解成 |
| --- | --- | --- |
| `flex-basis` | 初始尺寸是多少 | 我本来想要多大？ |
| `flex-grow` | 空间有剩余怎么办 | 有多的，多给我多少？ |
| `flex-shrink` | 空间不够怎么办 | 不够的时候，我承担多少？ |

整个过程可以理解成：

```text
                 Flex Container
                       │
                       ▼
             计算 Flex Base Size
                       │
                       │
                 flex-basis
                       │
                       ▼
               计算空间是否足够
                       │
                ┌──────┴──────┐
                │             │
              足够           不够
                │             │
                ▼             ▼
           剩余空间         空间不足
                │             │
                ▼             ▼
           flex-grow      flex-shrink
                │             │
                └──────┬──────┘
                       ▼
                   最终尺寸
```

这才是理解 Flex 的核心。

---

## 六、flex 是什么？

平时我们写：

```css
flex: 1;
```

其实 `flex` 是一个简写属性，它同时设置：

```text
flex-grow
flex-shrink
flex-basis
```

对于最常见的：

```css
flex: 1;
```

可以把它理解成：

```css
flex: 1 1 0%;
```

也就是：

```text
flex-grow   = 1
flex-shrink = 1
flex-basis  = 0%
```

注意最后这个：

```text
flex-basis = 0%
```

它其实就是理解 `flex: 1` 的钥匙。

---

## 七、为什么 flex: 1 会“平均分配”？

假设：

```css
.container {
  width: 600px;
  display: flex;
}

.item {
  flex: 1;
}
```

很多人会直接记：

> 三个 `flex: 1`，所以一人 200px。

结果当然没问题。

但真正发生的事情更接近：

```text
flex: 1
   ↓
auto-expansion
   ↓
flex-grow: 1
flex-shrink: 1
flex-basis: 0%
```

也就是说，参与空间分配时，三个 Item 的基础尺寸都从 0 开始计算。

于是：

```text
基础尺寸：
A = 0
B = 0
C = 0

容器剩余空间 ≈ 600px

grow：
1 : 1 : 1
```

最终得到：

```text
A = 200px
B = 200px
C = 200px
```

所以真正值得记住的是：

> **`flex: 1` 并不是一个神奇的“平均分配”属性，而是让项目以 0 基础尺寸参与空间分配。**

“平均分配”只是 `grow` 相同情况下得到的结果。

---

## 八、flex: 1 和 flex: auto 到底差在哪里？

现在来看最容易混淆的一对：

```css
flex: 1;
```

和：

```css
flex: auto;
```

`flex: auto` 可以理解成：

```css
flex: 1 1 auto;
```

也就是：

```text
flex-grow   = 1
flex-shrink = 1
flex-basis  = auto
```

于是两者真正的差异就出来了：

```text
flex: 1
    ↓
basis = 0%

flex: auto
    ↓
basis = auto
```

**关键就在 `flex-basis`。**

---

## 九、flex: 1：大家从 0 开始分

假设三个元素自身内容所对应的尺寸分别是：

```text
A = 100px
B = 200px
C = 300px
```

容器宽度为 600px。

如果：

```css
.item {
  flex: 1;
}
```

基础尺寸并不会简单按照 100 / 200 / 300 来作为起点，而是近似按照：

```text
A = 0
B = 0
C = 0
```

然后让 `flex-grow: 1` 去分配容器空间：

```text
600px
  ↓
1 : 1 : 1
  ↓
200 / 200 / 200
```

所以即使内容长度不同，三个区域依然会尽量保持相同的空间。

---

## 十、flex: auto：先尊重自己的尺寸，再分剩余空间

如果换成：

```css
.item {
  flex: auto;
}
```

也就是：

```css
flex: 1 1 auto;
```

此时 `flex-basis: auto` 会让基础尺寸参考项目自身的主轴尺寸。

仍然假设：

```text
A = 100px
B = 200px
C = 300px
```

容器为 600px。

基础尺寸总和正好：

```text
100 + 200 + 300 = 600px
```

因此没有剩余空间需要通过 grow 再分配，最终就会保持：

```text
A = 100px
B = 200px
C = 300px
```

如果容器扩大到 900px：

```text
基础尺寸：
100 + 200 + 300 = 600px

剩余空间：
900 - 600 = 300px
```

三个元素的 `flex-grow` 都是 1，所以再平均分掉这 300px：

```text
A = 100 + 100 = 200px
B = 200 + 100 = 300px
C = 300 + 100 = 400px
```

这就是两者最直观的区别：

```text
flex: 1

忽略原本尺寸作为分配起点
        ↓
从 0 开始参与分配
        ↓
更容易得到等比例区域
```

而：

```text
flex: auto

先考虑自身基础尺寸
        ↓
再分配剩余空间
        ↓
保留不同元素之间原本的尺寸差异
```

---

## 十一、一个实验就能彻底看懂

文章开头的 Flex 可视化实验场可以直接修改：

- 容器宽度
- `flex-grow`
- `flex-shrink`
- `flex-basis`

建议先把容器调整到 800px，三个 `grow` 保持 `1`，再拖动 `basis`。

你会看到一个非常直观的现象：

> **改变 `basis`，其实是在改变“分配之前的起点”；改变 `grow`，是在改变“剩余空间怎么分”。**

然后把容器宽度拖到小于三个基础尺寸之和，再调整 `shrink`，就可以看到另一套完全不同的行为。

这种交互实验其实比背一堆公式更容易建立直觉。

---

## 十二、width 和 flex-basis 也不是一回事

还有一个经常让人困惑的问题：

```css
.item {
  width: 200px;
  flex-basis: 100px;
}
```

到底应该按照 200px 还是 100px 来计算？

在 Flex 主轴方向上，当 `flex-basis` 不是 `auto` 时，它会作为 Flex Item 的基础尺寸参与 Flex 布局计算。

因此：

```css
flex-basis: 100px;
```

并不是简单地给元素再增加一个 100px 的宽度，而是在告诉 Flex：

> **把 100px 作为这次空间分配的基础尺寸。**

这也是为什么实际项目中经常会看到：

```css
.item {
  flex: 0 0 240px;
}
```

它表达的信息其实非常明确：

```text
grow   = 0
shrink = 0
basis  = 240px
```

也就是：

> **我要 240px，而且不要因为剩余空间而增长，也不要因为空间不足而收缩。**

---

## 十三、为什么 flex: 1 里面的长文字还是会把布局撑爆？

实际项目中还有一个非常经典的问题：

```css
.main {
  flex: 1;
}
```

看起来应该“有多少空间就占多少空间”。

但里面如果出现一个特别长的 URL、连续英文字符串或者某些不可断开的内容，有时你会发现：

> 怎么它还是不肯缩？

这通常和 Flex Item 的最小尺寸约束有关。

一个非常实用的写法是：

```css
.main {
  flex: 1;
  min-width: 0;
}
```

`min-width: 0` 的意思可以粗略理解成：

> **不要让内容的最小尺寸成为我的最低宽度，我允许自己继续缩小。**

所以实际开发中，如果出现：

```css
.container {
  display: flex;
}

.main {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 240px;
}
```

不要觉得 `min-width: 0` 是什么玄学 CSS。

它实际上是在解除一个非常具体的尺寸约束。

---

## 十四、顺便认识几个常见的 flex 简写

除了 `flex: 1`，下面几个也很常见：

| 写法 | 可以理解为 | 含义 |
| --- | --- | --- |
| `flex: 1` | `1 1 0%` | 参与增长和收缩，以 0 为基础分配 |
| `flex: auto` | `1 1 auto` | 保留自身基础尺寸，同时允许增长/收缩 |
| `flex: none` | `0 0 auto` | 不增长、不收缩，尺寸按自身规则确定 |
| `flex: 0 1 auto` | `0 1 auto` | 不主动增长，但空间不足时允许收缩 |

尤其是：

```css
flex: none;
```

很多时候比：

```css
flex-grow: 0;
flex-shrink: 0;
```

更直观。

---

## 十五、真正应该记住的，是这一张图

以后看到 Flex 布局，不妨在脑子里过一遍：

```text
               Flex Container
                      │
                      ▼
             ┌─────────────────┐
             │ 计算基础尺寸     │
             │ Flex Base Size  │
             └────────┬────────┘
                      │
                flex-basis
                      │
                      ▼
              空间够不够？
                │       │
              够         不够
                │           │
                ▼           ▼
          剩余空间       空间不足
                │           │
                ▼           ▼
           flex-grow   flex-shrink
                │           │
                └─────┬─────┘
                      ▼
                  最终尺寸
```

这样再看：

```css
flex: 1;
```

就不会只想到：

> “三个一，所以平分。”

而是会想到：

```css
flex: 1 1 0%;
```

然后问自己：

> **为什么它的 basis 是 0？**

同样看到：

```css
flex: auto;
```

就会想到：

```css
flex: 1 1 auto;
```

然后自然理解：

> **它为什么会保留元素自身的基础尺寸？**

---

## 十六、最后总结

如果只允许记住几句话，我认为下面这些就够了。

### `flex-basis`

> **决定 Flex Item 参与空间计算时的基础尺寸。**

可以理解成：

> “我先按这个尺寸算。”

### `flex-grow`

> **容器还有剩余空间时，决定我按照什么比例参与分配。**

可以理解成：

> “有多余空间，我要分多少。”

### `flex-shrink`

> **容器空间不足时，决定我按照什么收缩因子参与缩小。**

可以理解成：

> “空间不够，我承担多少。”

### `flex: 1`

```css
flex: 1 1 0%;
```

核心是：

> **以接近 0 的基础尺寸参与空间分配，因此很容易得到等比例布局。**

### `flex: auto`

```css
flex: 1 1 auto;
```

核心是：

> **先考虑元素自身的基础尺寸，再参与剩余空间的分配。**

---

## 写在最后

Flex 真正难的地方其实不是 API 多。

恰恰相反：

```text
flex-grow
flex-shrink
flex-basis
```

就三个属性。

难的是很多教程直接告诉我们：

```css
flex: 1;
```

然后说：

> “这是平均分配。”

于是我们可能用了很多年 Flex，却一直没有真正理解浏览器为什么这么分。

但一旦把 Flex 看成一个 **空间分配问题**，事情就简单很多：

```text
flex-basis
    ↓
确定基础尺寸
    ↓
计算剩余空间
    ↓
空间多了 → flex-grow
空间少了 → flex-shrink
    ↓
得到最终尺寸
```

这时候 `flex: 1`、`flex: auto`、`flex: none` 就不再是一堆需要死记的 CSS 黑魔法，而只是不同的参数组合。

**理解 Flex 的最好方式，不是继续背结论，而是亲手改变参数，看空间到底是怎么被分走的。**
