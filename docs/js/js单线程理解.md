# js 的单线程理解

首先看段代码

```js
function foo() {
  console.log('first');
  setTimeout(function () {
    console.log('second');
  }, 5);
}

for (var i = 0; i < 1; i++) {
  foo();
}
```

执行结果会首先全部输出 first，然后全部输出 second；尽管中间的执行会超过 5ms。

JS 运行在浏览器中，是单线程的，每个 window 一个 JS 线程，既然是单线程的，在某个特定的时刻只有特定的代码能够被执行，并阻塞其它的代码。

而浏览器是事件驱动的（Event driven），浏览器中很多行为是==异步（Asynchronized==）的，会==创建事件==并==放入执行队列中==。

javascript 引擎是单线程处理它的任务队列。所以当多个事件触发时，会依次放入队列，然后一个一个响应。（所以上面的代码是 5ms 后把输出 second 的任务加入队列，而当前有任务，所以只能等 1000000 个 first 输出完后才会输出 second）
