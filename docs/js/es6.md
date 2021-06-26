# es6 相关

## 1、let 和 const 命令

- let 与 const 不存在像 var 的变量提升

- 只要在块级作用域在使用 let 或 const 声明变量，之前使用了变量都不可以用，这称之为“暂时性死区”

```javascript
{
  tmp = 'abc'; // 报错 ReferenceError
  console.log(tmp); // 报错 ReferenceError
  let tmp = 123;
}
```

- 不允许重复声明

```javascript
function fn() {
  const PI = 3.1415926;
  const PI = 3.14; //报错
  const k = {
    a: 1,
  };
  k.b = 3;
  console.log(k); //正常显示
}
```

- 为什么需要使用块级作用域？

1.  内层变量可能会覆盖外层变量。

```javascript
var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';
  }
}

f(); // undefined
```

2. 用来计数的循环变量泄露为全局变量。

```javascript
var s = 'hello';
for (var i = 0; i < s.length; i++) {
  console.log(s[i]); //h e l l o
}

console.log(i); // 5
```

## 2、解构赋值

- 数组的解构赋值

对应值，允许有默认值

```javascript
{
  let a, b, rest;
  [a, b, c = 3] = [1, 2];
  console.log(a, b, 3); //1 2 3
}
```

...为之后的对应值

```javascript
{
  let a, b, rest;
  [a, b, ...rest] = [1, 2, 3, 4, 5, 6];
  console.log(a, b, rest); //1 2 [3,4,5,6]
}
```

- 对象的解构赋值

变量与 key 值同名，才能取到 value 值,如果取不到则 undefined

```javascript
{
  let a, b;
  ({ a, b } = { a: 1, b: 2 });
  console.log(a, b);
}
```

- 字符串的解构赋值

```javascript
const [a, b, c, d, e] = 'hello';
a; // "h"
b; // "e"
c; // "l"
d; // "l"
e; // "o"
```

可以设置字符串长度的

```javascript
let { length: len } = 'hello';
console.log(len); // 5
```

- 用途

1. 交换变量的值

```javascript
{
  let a = 1;
  let b = 2;
  [a, b] = [b, a];
  console.log(a, b); //2,1
}
```

2. 从函数返回多个值中取值

```javascript
function example() {
  return [1, 2, 3];
}
let [a, b, c] = example();
console.log(a, b, c); //1 2 3
```

3. 函数参数的定义

```javascript
//参数是一组有次序的值
function f([x, y, z]) {}
f([1, 2, 3]);

// 参数是一组无次序的值
function f({ x, y, z }) {}
f({ z: 3, y: 2, x: 1 });
```

4. 提取 JSON 数据

```javascript
let jsonData = {
  id: 42,
  status: 'OK',
  data: [867, 5309],
};

let { id, status, data: number } = jsonData;

console.log(id, status, number);
// 42, "OK", [867, 5309]
```

## 3、async 和 await

### async

看段代码：

```js
async function demo() {
  return 'hello async';
}

const result = demo();
console.log(result); //Promise { 'hello async' }
```

说明 asyn 函数返回的是一个 promise 对象。

那么当然可以用 then() 链来处理这个 Promise 对象。

```js
async function demo() {
  return 'hello async';
}
demo().then((v) => {
  console.log(v); //'hello async'
});
```

如果 async 函数没有返回值，又该如何？很容易想到，它会返回 Promise.resolve(undefined)。

```js
async function demo() {
  'hello async';
}

demo().then((v) => {
  console.log(v); //undefined
});
```

Promise 的特点——无等待，所以在没有 await 的情况下执行 async 函数，它会立即执行，返回一个 Promise 对象，并且，绝不会阻塞后面的语句

### await

因为 async 函数返回一个 Promise 对象，所以 await 可以用于==等待一个 async 函数的返回值==——这也可以说是 await 在等 async 函数，但要清楚，它等的实际是一个返回值。注意到 await 不仅仅用于等 Promise 对象，它可以等任意表达式的结果，所以，await 后面实际是可以接普通函数调用或者直接量的。所以下面这个示例完全可以正确运行

```js
function demo() {
  return 'something';
}

async function asyncDemo() {
  return Promise.resolve('hello async');
}

async function test() {
  const v1 = await demo();
  const v2 = await asyncDemo();
  console.log(v1, v2); //something hello async
}
```

### async/await 的优势在哪里

单一的 Promise 链并不能发现 async/await 的优势，但是，如果需要处理由多个 Promise 组成的 then 链的时候，优势就能体现出来了（很有意思，Promise 通过 then 链来解决多层回调的问题，现在又用 async/await 来进一步优化它）。

假设一个业务，分多个步骤完成，每个步骤都是异步的，而且依赖于上一个步骤的结果。我们仍然用 setTimeout 来模拟异步操作：

```js
/**
 * 传入参数 n，表示这个函数执行的时间（毫秒）
 * 执行的结果是 n + 200，这个值将用于下一步骤
 */
function takeLongTime(n) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(n + 200), n);
  });
}

function step1(n) {
  console.log(`step1 with ${n}`);
  return takeLongTime(n);
}

function step2(n) {
  console.log(`step2 with ${n}`);
  return takeLongTime(n);
}

function step3(n) {
  console.log(`step3 with ${n}`);
  return takeLongTime(n);
}
//现在用 Promise 方式来实现这三个步骤的处理
function doIt() {
  console.time('doIt');
  const time1 = 300;
  step1(time1)
    .then((time2) => step2(time2))
    .then((time3) => step3(time3))
    .then((result) => {
      console.log(`result is ${result}`);
      console.timeEnd('doIt');
    });
}

doIt();

// c:\var\test>node --harmony_async_await .
// step1 with 300
// step2 with 500
// step3 with 700
// result is 900
// doIt: 1507.251ms
```

输出结果 result 是 step3() 的参数 700 + 200 = 900。doIt() 顺序执行了三个步骤，一共用了 300 + 500 + 700 = 1500 毫秒，和 console.time()/console.timeEnd() 计算的结果一致。

如果用 async/await 来实现呢，会是这样

```js
async function doIt() {
  console.time('doIt');
  const time1 = 300;
  const time2 = await step1(time1);
  const time3 = await step2(time2);
  const result = await step3(time3);
  console.log(`result is ${result}`);
  console.timeEnd('doIt');
}

doIt();
```

结果和之前的 Promise 实现是一样的，但是这个代码看起来是不是清晰得多，几乎跟同步代码一样

还有更酷的

现在把业务要求改一下，仍然是三个步骤，但每一个步骤都需要之前每个步骤的结果。

```js
function step1(n) {
  console.log(`step1 with ${n}`);
  return takeLongTime(n);
}

function step2(m, n) {
  console.log(`step2 with ${m} and ${n}`);
  return takeLongTime(m + n);
}

function step3(k, m, n) {
  console.log(`step3 with ${k}, ${m} and ${n}`);
  return takeLongTime(k + m + n);
}
```

这回先用 async/await 来写：

```js
async function doIt() {
  console.time('doIt');
  const time1 = 300;
  const time2 = await step1(time1);
  const time3 = await step2(time1, time2);
  const result = await step3(time1, time2, time3);
  console.log(`result is ${result}`);
  console.timeEnd('doIt');
}

doIt();

// c:\var\test>node --harmony_async_await .
// step1 with 300
// step2 with 800 = 300 + 500
// step3 with 1800 = 300 + 500 + 1000
// result is 2000
// doIt: 2907.387ms
```

除了觉得执行时间变长了之外，似乎和之前的示例没啥区别啊！别急，认真想想如果把它写成 Promise 方式实现会是什么样子？

```js
function doIt() {
  console.time('doIt');
  const time1 = 300;
  step1(time1)
    .then((time2) => {
      return step2(time1, time2).then((time3) => [time1, time2, time3]);
    })
    .then((times) => {
      const [time1, time2, time3] = times;
      return step3(time1, time2, time3);
    })
    .then((result) => {
      console.log(`result is ${result}`);
      console.timeEnd('doIt');
    });
}

doIt();
```

有没有感觉有点复杂的样子？那一堆参数处理，就是 Promise 方案的死穴—— 参数传递太麻烦了，看着就晕！

[深入掌握 ECMAScript 6 异步编程](http://www.ruanyifeng.com/blog/2015/04/generator.html)

[ Promise 使用详解](http://www.hangge.com/blog/cache/detail_1638.html)
