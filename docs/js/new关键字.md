# new 关键字

## 1、new 详解

要创建 Person 的新实例，必须使用 new 操作符。

```javascript
function Person(name) {
  this.name = name;
}
Person.age = 20;
Person.prototype.say = function () {
  console.log('我是：' + this.name);
};

var xiaoming = new Person('小明');

console.log(xiaoming.name); //小明
console.log(xiaoming.age); //undefined
xiaoming.say(); //我是小明
```

```javascript
var xiaoming=new Person('小明');
//JS引擎执行这句代码时，在内部做了很多工作，用伪代码模拟其工作流程如下：
new Person("小明") = {

  var obj = {};  //创建个空对象

  obj.__proto__ = Person.prototype; // 对象的__proto__ 指向Person的原型对象prototype

  var result = Person.call(obj,"小明"); //修改Person的this指向新创建的对象obj后立即调用

  return typeof result === 'obj'? result : obj; //如果函数没有返回其他对象，那么new表达式中的函数调用会自动返回这个新对象。
}
```

1. 创建一个空对象 obj;
1. 把 obj 的**proto** 指向 Person 的原型对象 prototype，此时便建立了 obj 对象的原型链：obj->Person.prototype->Object.prototype->null
1. 在 obj 对象的执行环境调用 Person 函数并传递参数“小明”。 相当于 var result = obj.Person("cat")。
1. 当这句执行完之后，obj 便产生了属性 name 并赋值为"小明"。
1. 考察返回的返回值，如果无返回值或者返回一个非对象值，则将 obj 返回作为新对象；否则会将返回值作为新对象返回。

xiaoming 的原型链是：cat->Person.prototype->Object.prototype->null

![image](https://note.youdao.com/yws/api/personal/file/WEB2afe10dde92ab6e88e3ae11fd8450a33?method=download&shareKey=33a4cd7d06b15b432f285337d769c61f)

再看详细输出过程：

```javascript
console.log(xiaoming.name);
```

xiaoming.name -> 在过程（3）中，obj 对象就产生了 name 属性。因此 xiaoming.name 就是这里的 obj.name

```javascript
console.log(xiaoming.age);
```

xiaoming 会先查找自身的 age，没有找到便会沿着原型链查找，在上述例子中，我们仅在 Person 对象上定义了 age,并没有在其原型链上定义，因此找不到。undefind

```javascript
xiaoming.say();
```

xiaoming 会先查找自身的 say 方法，没有找到便会沿着原型链查找，在上述例子中，我们在 Person 的 prototype 上定义了 say,因此在原型链上找到了 say 方法.另外，在 say 方法中还访问 this.name，这里的 this 指的是其调用者 obj,因此输出的是 obj.name 的值。

## 2、new 存在的意义

认识了 new 运算符之后，我们再回到开篇提到的问题：JS 中万物皆对象，为什么还要通过 new 来产生对象？要弄明白这个问题，我们首先要搞清楚 xiaoming 和 Person 的关系。

通过上面的分析，我们发现 xiaoming 继承了 Person 中的部分属性，因此我们可以简单的理解：Person 和 xiaoming 是继承关系。

另一方面，xiaoming 是通过 new 产生的对象，那么 xiaoming 到底是不是 Person 的实例对象？ 我们先来了解一下 JS 是如何来定义“实例对象”的？

A instanceof B
如果上述表达式为 true,JS 认为 A 是 B 的实例对象，我们用这个方法来判断一下 xiaoming 和 Person

```javascript
xiaoming instanceof Person; //true
```

从执行结果看：xiaoming 确实是 Person 实例，要想证实这个结果，我们再来了解一下 JS 中 instanceof 的判断规则：

```javascript
var L = A.__proto__;
var R = B.prototype;
if (L === R) return true;
```

如果 A 的**proto** 等价于 B 的 prototype，就返回 true

在 new 的执行过程（2）中，xiaoming 的**proto**指向了 Person 的 prototype，所以 xiaoming 和 Person 符合 instanceof 的判断结果。因此，我们认为：xiaoming 是 Person 的实例对象。

在 javascript 中, 通过 new 可以产生原对象的一个实例对象，而这个实例对象继承了原对象的属性和方法。因此，new 存在的意义在于它实现了 javascript 中的继承，而不仅仅是实例化了一个对象！

[newd 到底干了什么？](https://juejin.im/post/584e1ac50ce463005c618ca2)

[**proto**和 prototype 的区别和联系](https://segmentfault.com/a/1190000009704212)
