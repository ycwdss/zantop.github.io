---
title: vue面试题
---

## 讲下 mvvm?

MVVM 是 Model-View-ViewModel 缩写，也就是把 MVC 中的 Controller 演变成 ViewModel。  
Model 层代表数据模型，View 代表 UI 组件  
ViewModel 是 View 和 Model 层的桥梁，数据会绑定到 viewModel 层并自动将数据渲染到页面中，视图变化的时候会通知 viewModel 层更新数据。

## vue2.x 的响应式数据原理

Vue 实现响应式数据的核心 API 是`Object.defineProperty`。

其实默认 Vue 在初始化数据时，会给 data 中的属性使用`Object.defineProperty`重新定义所有属性,当页面取到对应属性时会进行依赖收集（收集当前组件的 watcher） 如果属性发生变化会通知相关依赖进行更新操作。

1. 初始化用户传入的 data 数据（initData）
2. 将数据进行观测（new Observer）
3. 将数组的圆形方法指向重写的原型（protoAugment(value,arrayMethods)）
4. 讲数组的原型方法进行重写/深度观察数组中的每一项（对象类型 observeArray）

## vue3.x 的响应式数据原理

Vue3.x 改用`Proxy`替代`Object.defineProperty`。因为`Proxy`可以直接`监听对象和数组的变化`，并且有多达 13 种拦截方法。并且作为新标准将受到浏览器厂商重点持续的性能优化。

## vue2.x 中如何监测数组变化

使用了函数劫持的方式，重写了数组的方法，Vue 将 data 中的数组进行了原型链重写，指向了自己定义的数组原型方法。这样当调用数组 api 时，可以通知依赖更新。如果数组中包含着引用类型，会对数组中的引用类型再次递归遍历进行监控。这样就实现了监测数组变化

## nextTick 知道吗，实现原理是什么

**异步:**Vue 实现响应式并不是数据发生变化之后 DOM 立即变化，而是按一定的策略进行 DOM 的更新。

**事件循环：**Vue 在修改数据后，视图不会立刻更新，而是等同一事件循环中的所有数据变化完成之后，再统一进行视图更新

```js
//修改数据
vm.message = 'change';
//想要立即使用更新后的dom这样不行，因为设置message后的dom还没更新
console.log(vm.$el.textContent);
//在nextTick里面的代码会在dom更新后执行，会得到‘change'

Vue.nextTick(() => {
  console.log(vm.$el.textContent);
});
```

源码：

```js
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
    if (isIOS) setTimeout(noop);
  };
  isUsingMicroTask = true;
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}
```

1. 先定义了一个 callbacks 存放所有的 nextTick 里的回调函数
2. 然后判断一下当前的浏览器内核是否支持 Promise，如果支持，就用 Promise 来触发回调函数
3. 如果不支持 Promise 再看看是否支持 MutationObserver，是一个可以监听 DOM 结构变化的接口，观察文本节点发生变化时，触发执行所有回调函数。
4. 如果以上都不支持就只能用 setTimeout 来完成异步执行了。

使用场景：

在 Vue 生命周期的 created()钩子函数进行的 DOM 操作的时候需要要放在 Vue.nextTick()的回调函数中。

为啥呢？如果不熟悉 created()钩子的话可以再翻看一下 Vue 的生命周期，created 函数执行的时候 DOM 元素还没有进行过渲染，这个时候操作 DOM 毛用也没有，所以需要将 DOM 操作放在 Vue.nextTick()的回调方法中去搞定。

当然你可以选择在 mounted()钩子里去操作 DOM，这个时候所有的 DOM 都挂载到跟元素上并渲染完毕了。这个时候操作 DOM 元素是没有任何问题的。

数据变化后要执行的某个操作，而这个操作需要使用随数据改变而改变的 DOM 结构的时候，这个操作都应该放进 Vue.nextTick()的回调函数中。

ue 是异步执行 dom 更新的，一旦观察到数据变化，Vue 就会开启一个队列，然后把在同一个事件循环 (event loop) 当中观察到数据变化的 watcher 推送进这个队列。如果这个 watcher 被触发多次，只会被推送到队列一次。这种缓冲行为可以有效的去掉重复数据造成的不必要的计算和 DOm 操作。而在下一个事件循环时，Vue 会清空队列，并进行必要的 DOM 更新。
当你设置 vm.someData = 'new value'，DOM 并不会马上更新，而是在异步队列被清除，也就是下一个事件循环开始时执行更新时才会进行必要的 DOM 更新。如果此时你想要根据更新的 DOM 状态去做某些事情，就会出现问题。。为了在数据变化之后等待 Vue 完成更新 DOM ，可以在数据变化之后立即使用 Vue.nextTick(callback) 。这样回调函数在 DOM 更新完成后就会调用

## Vue 的生命周期

- beforeCreate 是 new Vue()之后触发的第一个钩子，在当前阶段 data、methods、computed 以及 watch 上的数据和方法都不能被访问。
- created 在实例创建完成后发生，当前阶段已经完成了数据观测，也就是可以使用数据，更改数据，在这里更改数据不会触发 updated 函数。可以做一些初始数据的获取，在当前阶段无法与 Dom 进行交互，如果非要想，可以通过 vm.\$nextTick 来访问 Dom。
- beforeMount 发生在挂载之前，在这之前 template 模板已导入渲染函数编译。而当前阶段虚拟 Dom 已经创建完成，即将开始渲染。在此时也可以对数据进行更改，不会触发 updated。
- mounted 在挂载完成后发生，在当前阶段，真实的 Dom 挂载完毕，数据完成双向绑定，可以访问到 Dom 节点，使用\$refs 属性对 Dom 进行操作。
- beforeUpdate 发生在更新之前，也就是响应式数据发生更新，虚拟 dom 重新渲染之前被触发，你可以在当前阶段进行更改数据，不会造成重渲染。
- updated 发生在更新完成之后，当前阶段组件 Dom 已完成更新。要注意的是避免在此期间更改数据，因为这可能会导致无限循环的更新。
- beforeDestroy 发生在实例销毁之前，在当前阶段实例完全可以被使用，我们可以在这时进行善后收尾工作，比如清除计时器。
  destroyed 发生在实例销毁之后，这个时候只剩下了 dom 空壳。组件已被拆解，数据绑定被卸除，监听被移出，子实例也统统被销毁。

## 你的接口请求一般放在哪个生命周期中？

接口请求一般放在 mounted 中，但需要注意的是服务端渲染时不支持 mounted，需要放到 created 中。

## Computed 和 Watch

**computed：** 是计算属性，依赖其它属性值，并且 computed 的值有缓存，只有它依赖的属性值发生改变，下一次获取 computed 的值时才会重新计算 computed 的值；

**watch：** 更多的是「观察」的作用，类似于某些数据的监听回调 ，每当监听的数据变化时都会执行回调进行后续操作；
运用场景： 1.当我们需要进行数值计算，并且依赖于其它数据时，应该使用 computed，因为可以利用 computed 的缓存特性，避免每次获取值时，都要重新计算；

2.当我们需要在数据变化时执行异步或开销较大的操作时，应该使用 watch，使用 watch 选项允许我们执行异步操作 ( 访问一个 API )，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。

## 说一下 v-if 和 v-show 的区别

当条件不成立时，v-if 不会渲染 DOM 元素，v-show 操作的是样式(display)，切换当前 DOM 的显示和隐藏

## 组件中的 data 为什么是一个函数？

一个组件被复用多次的话，也就会创建多个实例。本质上，这些实例用的都是同一个构造函数。如果 data 是对象的话，对象属于引用类型，会影响到所有的实例。所以为了保证组件不同的实例之间 data 不冲突，data 必须是一个函数。

## 虚拟 Dom 以及 key 属性的作用

由于在浏览器中操作 DOM 是很昂贵的。频繁的操作 DOM，会产生一定的性能问题。这就是虚拟 Dom 的产生原因

Virtual DOM 本质就是用一个原生的 JS 对象去描述一个 DOM 节点。是对真实 DOM 的一层抽象。

VirtualDOM 映射到真实 DOM 要经历 VNode 的 create、diff、patch 等阶段

「key 的作用是尽可能的复用 DOM 元素。」
新旧 children 中的节点只有顺序是不同的时候，最佳的操作应该是通过移动元素的位置来达到更新的目的。
需要在新旧 children 的节点中保存映射关系，以便能够在旧 children 的节点中找到可复用的节点。key 也就是 children 中节点的唯一标识。

## 何时需要使用 keep-alive?

缓存组件，不需要重复渲染  
如多个静态 tab 页面切换，可以优化性能  
常用的两个属性 include/exclude，允许组件有条件的进行缓存。  
两个生命周期 activated/deactivated，用来得知当前组件是否处于活跃状态。  
keep-alive 的中还运用了 LRU(Least Recently Used)算法。

## Vue 中组件生命周期调用顺序说一下

组件的调用顺序都是`先父后子`,渲染完成的顺序是`先子后父`。
组件的销毁操作是`先父后子`，销毁完成的顺序是`先子后父`。

**加载渲染过程**

`父 beforeCreate->父 created->父 beforeMount->子 beforeCreate->子 created->子 beforeMount- >子 mounted->父 mounted`

**子组件更新过程**

`父 beforeUpdate->子 beforeUpdate->子 updated->父 updated`

**父组件更新过程**

`父 beforeUpdate -> 父 updated`

**销毁过程**

`父 beforeDestroy->子 beforeDestroy->子 destroyed->父 destroyed`

## Vue2.x 组件通信有哪些方式？

**父子组件通信**

父->子 props，子->父 $on、$emit

获取父子组件实例 $parent、$children

Ref 获取实例的方式调用组件的属性或者方法

Provide、inject 官方不推荐使用，但是写组件库时很常用

**兄弟组件通信**

Event Bus 实现跨组件通信

`Vue.prototype.$bus = new Vue`

Vuex

**跨级组件通信**

`Vuex`

`$attrs、$listeners`

`Provide、inject`

## SSR 了解吗？

SSR 也就是服务端渲染，也就是将 Vue 在客户端把标签渲染成 HTML 的工作放在服务端完成，然后再把 html 直接返回给客户端。
SSR 有着更好的 SEO、并且首屏加载速度更快等优点。不过它也有一些缺点，比如我们的开发条件会受到限制，服务器端渲染只支持 beforeCreate 和 created 两个钩子，当我们需要一些外部扩展库时需要特殊处理，服务端渲染应用程序也需要处于 Node.js 的运行环境。还有就是服务器会有更大的负载需求。

## 你都做过哪些 Vue 的性能优化？

- 尽量减少 data 中的数据，data 中的数据都会增加 getter 和 setter，会收集对应的 watcher
- v-if 和 v-for 不能连用
- 如果需要使用 v-for 给每项元素绑定事件时使用事件代理
- SPA 页面采用 keep-alive 缓存组件
- 在更多的情况下，使用 v-if 替代 v-show
- key 保证唯一使用路由懒加载、异步组件防抖、节流
- 第三方模块按需导入
- 长列表滚动到可视区域动态加载图片懒加载

## 打包优化

- 压缩代码
- Tree Shaking/Scope Hoisting
- 使用 cdn 加载第三方模块
- 多线程打包 happypack
- splitChunks 抽离公共文件
- sourceMap 优化

## hash 路由和 history 路由实现原理说一下

location.hash 的值实际就是 URL 中#后面的东西。

history 实际采用了 HTML5 中提供的 API 来实现，主要有 history.pushState()和 history.replaceState()。

## ref 的作用

1. 获取 dom 元素 this.\$refs.box
2. 获取子组件中的 data this.$refs.box.msg
调用子组件中的方法this.$refs.box.open()

[vue 面试题](https://blog.csdn.net/huoren_no1/article/details/105339320)

[Vue render 函数](https://www.jianshu.com/p/7508d2a114d3)

[Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/v2/prepare/)
