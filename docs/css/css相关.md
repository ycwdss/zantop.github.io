---
title: css相关知识
---

## 什么是bfc?


bfc形成一块盒子，盒子内的布局，不管是float还是position，都不会影响bfc之外的布局。

哪些元素有bfc的条件？  
display: block list-item table

怎么触发bfc?
- float 的值不为none。
- position 的值不为static或者relative。
- display的值为 table-cell, table-caption, inline-block, flex, 或者 inline-flex中的其中一个。
- overflow的值不为visible。

bfc特征？

- bfc盒子内部box是垂直排列的
- box垂直方向的距离由margin决定，同一个bfc内部两个相邻Box的margin会发生重叠
- bfc盒子的border内边框左侧与box接触
- bfc的区域不会与float box重叠，而是紧贴浮动边缘
- bfc是个独立容器，里面元素不会影响外面元素
- 计算bfc高度时，浮动元素也参与计算

bfc用途？
- 清除元素内部浮动(计算bfc高度时，浮动元素也参与计算),给父元素添加触发bfc条件
- 解决margin合并的问题，同一个bfc内部两个box的margin会有合并的问题，可以在bfc内部其中一个box包裹一层也触发bfc就会解决合并问题
- 用于布局，盒子内box1是浮动，box2触发bfc就可以实现box2的自适应布局
  
示例：
<iframe src="https://codesandbox.io/s/css-bfc-6zpce"></iframe> 


2. [pointer-events](https://developer.mozilla.org/zh-CN/docs/Web/CSS/pointer-events)
3. [css3 实现优惠券效果（向内凹的圆）](https://blog.csdn.net/pinena/article/details/89708024)

## flex布局

父元素和子元素各6个

**父元素**
- flex-direction: `row | row-reverse | column | column-reverse`;
  flex-direction属性决定主轴的方向

- flex-wrap: `nowrap | wrap | wrap-reverse`;
  默认情况下，项目都排在一条线（又称”轴线”）上。
- flex-flow: `<flex-direction> <flex-wrap>` 
  flex-flow属性是flex-direction属性和flex-wrap属性的简写形式，默认值为row nowrap;
- justify-content: `flex-start | flex-end | center | space-between | space-around`;
  justify-content属性定义了项目在主轴上的对齐方式
- align-items: `flex-start | flex-end | center | baseline | stretch`;
  align-items属性定义项目在交叉轴上如何对齐,baseline项目的第一行文字的基线对齐。
  stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度
- align-content: `flex-start | flex-end | center | space-between | space-around | stretch`;
  align-content属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。
  意思就是子项单行无效果，多行才有效果
  
**子元素**

- order: `<integer>`
    order属性定义项目的排列顺序。数值越小，排列越靠前，默认为0;
- flex-grow:` <number>; /* default 0 */ `
  flex-grow属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大。
- flex-shrink: `<number>; /* default 1 */ `
  flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。
- flex-basis: `<length> | auto; /* default auto */`  [Flex Basis 与 Width 的区别](https://www.jianshu.com/p/17b1b445ecd4)
- flex:` none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ] `
  flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto。后两个属性可选。
- align-self: `auto | flex-start | flex-end | center | baseline | stretch;`



示例：
<iframe src="https://codesandbox.io/s/css-flex-fmue3"></iframe> 
