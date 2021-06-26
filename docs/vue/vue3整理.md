# vue3 learn

## 响应式原理

vue2.x是基于ES5 的API `Object.defineProperty` 来操作属性的 `getter/setter` 实现的。其主要目的就是弥补 
`Object.defineProperty` 自身的一些缺陷，例如无法检测到对象属性的新增或者删除，不能监听数组的变化等。


Vue3 就是基于 Proxy 对其数据响应系统进行了重写，现在这部分可以作为独立的模块配合其他框架使用。

数据响应可分为三个阶段：`初始化阶段 –> 依赖收集阶段 –> 数据响应阶段`






