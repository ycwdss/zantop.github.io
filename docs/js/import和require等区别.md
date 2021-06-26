1、基本问题

module.exports和exports是属于CommonJS模块规范！（不清楚commonjs?大神请这边逛一逛[commonjs规范](http://javascript.ruanyifeng.com/nodejs/module.html)）

export和export default是属于ES6语法（不清楚ES6?大神请这边逛一逛[ES6模块](http://es6.ruanyifeng.com/#docs/module)）！

同样import和require分别属于ES6和CommonJS！


CommonJS模块规范 

> * 引入模块：require
> * 导出模块：module.exports和exports

ES6语法

> * 引入模块：import
> * 导出模块：export和export default


  **区别**

require/exports和import/export的主要区别在于书写的形式上
```js
//require/exports的写法

const foo = require("./foo");
//exports是module.exports的引用，在下文详述。
exports.foo = foo;
module.exports = foo;

//import/export的写法
import foo from "./foo"
import {foo} from "./foo"
import * as foo from "./foo"
export default foo
export const foo
export * from "foo"
```

exports和module.exports的区别：

- exports是module.exports的引用，即exports的指针指向module.exports的内存地址。
- require只接受module.exports不接受exports

exports和module.exports都是object类型，属于引用类型数据，exports的内存地址和module.exports的内存地址是一样的。简单的讲就是其中一个改变了，另外一个也跟着改变。

```js
exports.foo = "stupid"
console.log(module.exports.foo)
//stupid

//但当exports指向另外一个对象的时候，情况就不同了.
//这时exports的内存地址指向一个新的对象。
exports = {
    foo: "stupid"
}

console.log(module.exports.foo === exports.foo)
//false
```