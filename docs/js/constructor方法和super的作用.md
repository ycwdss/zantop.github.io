# constructor 方法和 super 的作用

```js
function Person1(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  Person1.prototype.say = function () {
    return `我叫${this.name},${this.age}岁了`;
  };
  //es6
  class Person2 {
    constructor(public name: string, public age: number) {
      this.name = name;
      this.age = age;
    }
    say() {
      return `我叫${this.name},${this.age}岁了`;
    }
  }

  class Child1 extends Person2 {
    constructor(public name: string, public age: number) {
      super(name, age);
    }
  }

  const student = new Child1("小王", 12); //我叫小王,12岁了
```

**constructor**

constructor 方法是类的构造函数，是一个默认方法，通过 new 命令创建对象实例时，自动调用该方法。

`一个类必须有 constructor 方法，如果没有显式定义，一个默认的 consructor 方法会被默认添加。`

**所以即使你没有添加构造函数，也是会有一个默认的构造函数的。**

一般 constructor 方法返回实例对象 this ，但是也可以指定 constructor 方法返回一个全新的对象，让返回的实例对象不是该类的实例。

**super**

1. 当函数使用

在 constructor 中必须调用 super 方法，因为子类没有自己的 this 对象，而是继承父类的 this 对象，然后对其进行加工,而 super 就代表了父类的构造函数。super 虽然代表了父类 Person 的构造函数，但是返回的是子类 Child 的实例，即 super 内部的 this 指的是 Child，因此 super() 在这里相当于 ``Person.prototype.constructor.call(this, props)`

```js

  //es6
  class Person {
    constructor(public name: string, public age: number) {
      this.name = name;
      this.age = age;
    }
    say() {
      return `我叫${this.name},${this.age}岁了`;
    }
  }

  class Child extends Person {
    constructor(public name: string, public age: number) {
      super(name, age);
    }
  }

  const student = new Child("小王", 12); //我叫小王,12岁了


```

在 super() 执行时，它指向的是 子类 Child 的构造函数，而不是父类 Person 的构造函数。也就是说，super() 内部的 this 指向的是 Child

1. 对象使用

在普通方法中，指向父类的原型对象；在静态方法中，指向父类。

```js
 class Person {
    constructor(public name: string, public age: number) {
      this.name = name;
      this.age = age;
    }
    say() {
      return `我叫${this.name},${this.age}岁了`;
    }
  }
  class Child extends Person {
    constructor(public name: string, public age: number) {
      super(name, age);
      console.log(super.say()); //我叫小王2,22岁了
    }
  }
  const student = new Child("小王2", 22);
```

super 在普通方法中指向`Person.prototype`,所以调用`super.say()`就相当于`Person.prototype.say()`

```js
 class Child extends Person {
    constructor(public name: string, public age: number) {
      super(name, age);
      this.name="我是儿子"
      console.log(super.say()); //我叫小王2,22岁了
    }
    hello(){
      return `我叫${this.name},${this.age}岁了`
    }
  }
  const student = new Child("小王2", 22);
 console.log(student2.hello()); //我叫儿子,22岁了
```

super.say() 虽然调用的是 `Person.prototytpe.say()`，但是 `Person.prototytpe.say()`会绑定子类 student 的 this，导致输出的是 `我叫儿子,22岁了`，而不是 `我叫小王2,22岁了`。也就是说，实际上执行的是 super.hello.call(this)

由于绑定子类的 this，所以如果通过 super 对某个属性赋值，会在实例的 prototype 上挂载属性

```js
super.name = '我是super改变的';

//Child.prototype.name上
```

````js
 super();
 console.log(super); // 报错
```
使用 super 的时候，必须显式指定是作为函数，还是作为对象使用，否则会报错。

[详解 es6 class 语法糖中 constructor 方法和 super 的作用](https://www.cnblogs.com/thomas-yang-github/p/11621067.html)
````
