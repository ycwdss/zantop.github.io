# this 详解

主要从以下几个方面介绍：

> 函数调用中
> 对象方法调用
> 构造函数
> apply 和 call 中

## 默认绑定（函数调用中）

```javascript
function foo() {
  console.log(this.a); //window
}
var a = 2;
foo(); //全局变量
```

函数调用中的 this 也指向全局变量。

```javascript
function foo() {
  'use strict';
  console.log(this.a); //window
}
var a = 2;
foo(); //undefined
```

注：ECMAScript5 的 strict 模式不存在全局变量，这里的 this 是 undefined。

## 隐式绑定（对象方法调用）

或者说调用的位置是否有上下文对象。

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo,
};
obj.foo(); //2
//调用位置会使用test上下文来引用函数，会把函数的this隐式的绑定到这个上下文对象上,注意是函数调用的位置。
```

如果是多个对象属性链中引用，只有最后一层或者说最后一层调用的位置起作用。

```javascript
function foo() {
  console.log(this.a);
}
var obj1 = {
  a: 1,
  foo,
};
var obj2 = {
  a: 2,
  obj1,
};
obj2.obj1.foo();
```

**隐式丢失**

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 1,
  foo,
};
var bar = obj.foo; //函数别名
var a = 2;
bar(); //undefined
```

bar 是 obj.foo 的一个引用，实际上引用的是 foo 函数本身，而 bar()其实是一个不带任何修饰的函数调用。

一种更微妙的情况发生在传入回调函数。

```javascript
function foo() {
  console.log(this.a);
}
function doFn(fn) {
  //fn其实是引用的foo
  fn(); //函数调用
}
var obj = {
  a: 1,
  foo,
};
var a = 2;
doFn(obj.foo); //2
//this要看函数调用的位置
```

## 显示绑定(apply,call,bind,js 内置 api 调用的“上下文”)

**1、call**

```javascript
function foo(sth1,sth2){
    console.log(this.a,sth1,sth2)
}
var obj={
    a=1;
}
var a=2;
foo.call(obj,22,33); //1,22,33
```

call 可以修改 this 指向，第一个参数是要指向的对象，后面的是参数，修改后立即执行。

**2、apply**

```javascript
function foo(sth1, sth2) {
  console.log(this.a, sth1, sth2);
}
var obj = {
  a: 1,
};
var a = 2;
foo.apply(obj, [22, 33]); //1 ,22,33
```

apply 跟 call 用法类似，只是后面的参数是数组，修改后立即执行。

**3、bind**
可以使用个辅助函数实现 bind 绑定 this 的效果

```javascript
function foo(sth1, sth2) {
  console.log(this.a, sth1, sth2);
}
var obj = {
  a: 1,
};
var a = 2;
function bind(fn, obj) {
  return function() {
    return fn.apply(obj, arguments);
  };
}
var bar = bind(foo, obj);
var b = bar(22, 33);
console.log(b); //1,22,33
```

es5 中也内置了 bind 方法。

```javascript
function foo(sth1, sth2) {
  console.log(this.a, sth1, sth2);
}
var obj = {
  a: 1,
};
var bar = foo.bind(obj);
bar(22, 33); //1,22,33
```

与 call apply 不同的是 bind 不会立即执行，他只是简单的绑定了 this

**4、上下文**

```javascript
var obj = {
  id: 1,
};
function foo(index) {
  console.log(index, this.id);
}
['a', 'b', 'b'].forEach(foo, obj); //a 1 b 1 c 1
```

## new 绑定（构造函数）

使用 new 来调用函数，会自动执行下面的操作：
1、创建一个新对象
2、这个新对象会被执行[[原型]]连接
3、这个新对象会绑定到函数调用的 this
4、如果函数没有返回其他对象，那么 new 表达式中的函数调用会自动返回这个新对象。

```javascript
function Foo(num) {
  this.num = num;
}
var instance = new Foo(20);
console.log(instance); //Foo { num: 20 }
console.log(instance.num); //20
```

在构造函数内部，this 指向新创建的对象

## 图解

![](https://open.zantop.cn/blog/this1.jpg)
![](https://open.zantop.cn/blog/this2.jpg)
![](https://open.zantop.cn/blog/this3.jpg)

相关文章：

1. [JavaScript 中的 this](https://segmentfault.com/a/1190000000638443)
2. [JS 中 this 关键字详解](https://segmentfault.com/a/1190000003046071#articleHeader4)
3. [Javascript 中 this 关键字详解](http://www.cnblogs.com/justany/archive/2012/11/01/the_keyword_this_in_javascript.html)
4. [this 词法](https://blog.csdn.net/liuyan19891230/article/details/50058551)
