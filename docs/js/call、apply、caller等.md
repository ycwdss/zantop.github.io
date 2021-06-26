# call、apply、caller 等

## arguments

ECMAScript 中的参数在内部使用一个类数组来表示的，函数接收到的始终是这个类数组，在函数体内可以通过 arguments 对象来访问这个参数数组，arguments 对象其实是一个类数组，不是 Array 的实例，可以通过方括号语法来访问，同时也可以使用 length
方法.

<!--more-->

```javascript
//arguments对象可以与命名参数一起使用
function test(num1, num2) {
  // alert(arguments[0]  undefined值  arguments指的实参
  if (arguments.length == 1) {
    alert(num1);
  } else if (arguments.length == 2) {
    alert(arguments[0] + num2); //num1==arguments[0];
  }
}
test(); // 没有传递值的命名参数将自动被赋予undefined值
test(10); //10
test(10, 20); //30
```

```javascript
function fn1(a, b) {
  console.log(fn1.length); //2 形参的长度
  console.log(arguments.length); //2 实参的长度
  return a + b;
}
//console.log(fn1(2，3));//5

//console.log(fn1(2));  //NaN
// console.log(fn1(2,3,4));//5
```

## callee

虽然 arguments 的主要用途是保存函数参数，但这个对象还有一个名叫 callee 的属性，该属性是一个指针，指向拥有 arguments 这个对象的函数。
返回正被执行的 Function 对象，即指定的 Function 对象的正文。

```javascript
function fn() {
  alert(arguments.callee);
}
fn();
/*function fn() {
      alert(arguments.callee);
      }*/
```

例如下面阶乘的例子：

```javascript
function factorial(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * factorial(num - 1);
  }
}
alert(factorial(3)); //6
//下面可以使用arguments.callee
function factorial(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * arguments.callee(num - 1);
  }
}
alert(factorial(2)); //2
```

callee 属性的初始值就是正在被执行的 function 对象。callee 属性是 arguments 对象的一个成员，它表示对函数对象本身的引用，这有利于匿名函数的递归或确保函数的封装性，需要注意的是 callee 拥有 length 属性，arguments.length 是实参长度，arguments.callee.length 是形参长度，由此能够判断调用时形参长度是否和实参长度一致。
callee 既然是正在被执行的 function 对象,那么下面就会涉及到函数的自执行，申明并立即执行,下面说下函数自执行！

```javascript
function fn1() {
  alert(1);
}
fn1();
```

如果说让它直接调用函数自己，可以是这样

```javascript
function fn1() {
            alert(1);
        }();
//这样是错误的，因为函数自执行前面需要时表达式，可以转换成这样
（function fn1() {
            alert(1);
        })();
 //这样也是一种闭包写法，里面定义一些变量，以致于不会污染全局，或者用其他运算符让它变成表达式
 ~function fn1() {
             alert(1);
         }();
```

例子拓展 选项卡：

```html
<div id="div1">
  <input type="button" value="按钮一" style="background-color: yellow" />
  <input type="button" value="按钮一" />
  <input type="button" value="按钮一" />
  <p style="display: block;">11111</p>
  <p>222222</p>
  <p>333333</p>
</div>
<script>
  window.onload = function () {
    var aInput = document.getElementsByTagName('input');
    var aP = document.getElementsByTagName('p');

    for (var i = 0; i < aInput.length; i++) {
      //show(i);
      //下面是自执行的方法。
      (function (i) {
        //--这里的i并不是传进去的i,只是当前的参数局部变量i
        aInput[i].onclick = function () {
          for (var j = 0; j < aInput.length; j++) {
            aInput[j].style.background = '';
            aP[j].style.display = 'none';
          }

          aInput[i].style.background = 'yellow';
          aP[i].style.display = 'block';
        };
      })(i);
    }

    /*function show(index) {
                aInput[index].onclick = function() {
                    for (var i=0; i<aInput.length; i++) {
                        aInput[i].style.background = '';
                        aP[i].style.display = 'none';
                    }

                    aInput[index].style.background = 'yellow';
                    aP[index].style.display = 'block';
                }
            }*/
  };
</script>
```

## caller

对于函数来说，caller 属性只有在函数执行时才有定义。caller 这个属性保存着调用当前函数的函数作用域；
调用该函数的函数

```javascript
function fn1() {
  console.log(1);
  console.log(fn1.caller);
}

function fn2() {
  console.log(2);
  console.log(fn2.caller);
  fn1();
}

fn2(); //2 -> null -> 1 -> fn2
```

## call 和 apply

都是更改 this 的指向，只是在参数的传递上是不同的，apply 是以类似数组的形式

```javascript
//先来一个对象big吧
var big = {
  name: '大哥',
  saying: function (age) {
    console.log(this.name, 'age:', age);
  },
};

//再来一个small对象
var small = {
  name: '小弟',
};

//如果想调用big的saying方法来说出‘小弟’:
//使用bind方法
big.saying.bind(small)(20); //打印结果为小弟 age: 20
//使用call方法
big.saying.call(small, 20); //打印结果为小弟 age: 20
//使用apply方法
big.saying.apply(small, [20]); //打印结果为小弟 age: 20
```

所以，其实三种方法都可以达到同一个结果，至于区别就很显而易见了。

        bind只是单纯将一个函数里的this的指向明确指定为small了，如果要执行函数，就要在后面加括号调用了。

        call就是直接执行一个自己指定this指向的函数，参数是一个一个传递。

        apply和call的区别就是，参数是放进一个数组中传递。

        实际上，很多时候我们在一个函数中，想用到其他的函数，但是其他函数的this指向就不明确，所以就会在自己的函数里面通过这三个方法来调用函数，例如：

那么有个例子，求数组中最大的

```javascript
var arr = [1, 6, 4, 8, 3, 10, 2];
//console.log( Math.max(1,6,4,8,3,10,2) );
//max里面只能写这样的，太麻烦了 arguments => [1,6,4,8,3,10,2]
console.log(Math.max.apply(null, arr));
// this不变设置为null  arguments => arr
```

## this

可以分为以下几块记.
函数外 ： window
函数内 ：
当一个函数被对象调用，则该函数内的 this 指向调用该函数的对象
当一个函数被事件调用，则该函数内的 this 指向触发该事件的对象
通过 call、apply 去调用一个函数，那么这个函数指向 call、apply 的第一个参数（如果 call、apply 的第一个参数是 undefined/null，则 this 指向调用该函数的对象）

## null 和 undefined

JavaScript 的最初版本是这样区分的：null 是一个表示”无”的对象，转为数值时为 0；undefined 是一个表示”无”的原始值，转为数值时为 NaN。

```javascript
Number(undefined);
// NaN

5 + undefined;
// NaN
```

目前，null 和 undefined 基本是同义的，只有一些细微的差别。
null 表示”没有对象”，即该处不应该有值。典型用法是：
（1） 作为函数的参数，表示该函数的参数不是对象。
（2） 作为对象原型链的终点。

```javascript
Object.getPrototypeOf(Object.prototype); // null
```

undefined 表示”缺少值”，就是此处应该有一个值，但是还没有定义。典型用法是：
（1）变量被声明了，但没有赋值时，就等于 undefined。
（2) 调用函数时，应该提供的参数没有提供，该参数等于 undefined。
（3）对象没有赋值的属性，该属性的值为 undefined。
（4）函数没有返回值时，默认返回 undefined。

```javascript
var i;
i; // undefined

function f(x) {
  console.log(x);
}
f(); // undefined

var o = new Object();
o.p; // undefined

var x = f();
x; // undefined
```

## 前端面试题

[面试题](http://www.runoob.com/w3cnote/front-end-developer-questions-and-answers.html)
