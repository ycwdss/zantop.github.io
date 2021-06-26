# js 模块化

## 伪模块化

函数模式/对象模式/闭包模式

```js
//函数模式
function fn1() {}
//对象模式
const module = {
  add: 1,
  fn1: function () {},
};
//闭包模式
(function (window) {
  var data = 'data';

  function showData() {
    console.log(`data is ${data}`);
  }
  function updateData() {
    data = 'newData';
    console.log(`data is ${data} `);
  }
  window.module1 = { showData, updateData };
})(window);
```

## 多宗标准时代

### common.js

> 引入模块：require  
> 导出模块：module.exports 和 exports

```js
//require/exports的写法
const foo = require('./foo');
//exports是module.exports的引用，在下文详述。
exports.foo = foo;
module.exports = foo;
```

exports 和 module.exports 的区别：

- exports 是 module.exports 的引用，即 exports 的指针指
- module.exports 的内存地址。
  require 只接受 module.exports 不接受 exports

exports 和 module.exports 都是 object 类型，属于引用类型数据，exports 的内存地址和 module.exports 的内存地址是一样的。简单的讲就是其中一个改变了，另外一个也跟着改变。

```js
exports.foo = 'stupid';
console.log(module.exports.foo);
//stupid
//但当exports指向另外一个对象的时候，情况就不同了.
//这时exports的内存地址指向一个新的对象。
exports = {
  foo: 'stupid',
};
console.log(module.exports.foo === exports.foo);
//false
```

### AMD

AMD 规范，全称为：Asynchronous Module Definition。存在即合理，从 Node.js 搬过来的 CommonJS 已经可以帮助前端实现模块化了，那 AMD 存在的意义又是什么呢？

这还要从 Node.js 自身说起，Node.js 运行于服务器端，文件都存在本地磁盘中，不需要去发起网络请求异步加载，所以 CommonJS 规范加载模块是同步的，对于 Node.js 来说自然没有问题，但是应用到浏览器环境中就显然不太合适了。 AMD 规范就是解决这一问题的。

AMD 不同于 CommonJS 规范，是异步的，可以说是专为浏览器环境定制的。AMD 规范中定义了如何创建模块、如何输出、如何导入依赖。
更加友好的是，require.js 库为我们准备好了一切，我们只需要通过 define 方法，定义为模块；再通过 require 方法，加载模块。
因为是异步的，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。

**define 定义模块**
define 方法的第一个参数可以注入一些依赖的其他模块，如 jQuery 等

```js
define([], function () {
  // 模块可以直接返回函数，也可返回对象
  return {
    fn() {
      // ...
    },
  };
});
```

**AMD 规范也采用 require 方法加载模块**

但是不同于 CommonJS 规范，它要求两个参数：
第一个参数就是要加载的模块的数组集合，第二个参数就是加载成功后的回调函数。

```js
require([module], callback);
```

### CMD

CMD 规范全称为：Common Module Definition，综合了 CommonJS 和 AMD 规范的特点，推崇 as lazy as possible。代表库为 `sea.js` 。

CMD 规范和 CMD 规范不同之处：

- AMD 需要异步加载模块，而 CMD 可以同步可以异步；
- CMD 推崇依赖就近，AMD 推崇依赖前置。

### UMD

UMD 叫做通用模块定义规范（Universal Module Definition）。
它可以通过运行编译时让同一个代码模块在使用 CommonJs、CMD 甚至是 AMD 的项目中运行。
这样就使得 JavaScript 包运行在浏览器端、服务区端甚至是 APP 端都只需要遵守同一个写法就行了。

他的规范就是综合其他的规范，没有自己专有得规范。

```js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD 规范
    define(['b'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // 类 Node 环境，并不支持完全严格的 CommonJS 规范
    // 但是属于 CommonJS-like 环境，支持 module.exports 用法
    module.exports = factory(require('b'));
  } else {
    // 浏览器环境
    root.returnExports = factory(root.b);
  }
})(this, function (b) {
  // 返回值作为 export 内容
  return {};
});
```

在定义模块得时候会检测当前得环境，将不同的模块定义方式转换为同一种写法

### ES 模块化

> 引入模块：import  
> 导出模块：export 和 export default

ES 模块化最大的两个特点是：

1. ES 模块化规范中模块输出的是值的引用

复习下 CommonJS 规范下的使用：

```js
//module.js
var data = 'data';
function updateData() {
  data = 'newData';
}

module.exports = {
  data: data,
  updateData: updateData,
};
//index.js
var myData = require('./module1').data;
var updateData = require('./module1').updateData;
console.log(myData); // data
updateData();
console.log(myData); // data
```

因为 CommonJS 规范下，输出的值只是拷贝，通过 updateData 方法改变了模块内的 data 的值，但是 data 和 myData 并没有任何关联，只是一份拷贝，所以模块内的变量值修改，也就不会影响到修改之前就已经拷贝过来的 myData 啦。

再看 ES 模块化规范的表现

```js
//module
let data = 'data';
function updateData() {
  data = 'newData';
}
export { data, updateData };

//index.js
import { data, updateData } from './module1.js';
console.log(data); // data
updateData();
console.log(data); // newData
```

由于 ES 模块化规范中导出的值是引用，所以不论何时修改模块中的变量，在外部都会有体现。

2. 静态化，编译时就确定模块之间的关系，每个模块的输入和输出变量也是确定的

**ES 模块化设计成静态的目的何在？**

首要目的就是为了实现`tree shaking` 提升运行性能（下面会简单说 `tree shaking`）。

**ES 模块化的静态特性也带来了局限：**

- import 依赖必须在文件顶部；
- export 导出的变量类型严格限制；
- 依赖不可以动态确定。

**ES 的 export 和 export default 要用谁？**

ES 模块化导出有 export 和 export default 两种。这里我们建议减少使用 export default 导出！

**原因很简单：**

- export default 导出整体对象，不利于 tree shaking；
- export default 导出的结果可以随意命名，不利于代码管理；

### tree shaking

`tree shaking` 就是通过减少 web 项目中 JavaScript 的无用代码，以达到减少用户打开页面所需的等待时间，来增强用户体验。对于消除无用代码，并不是 JavaScript 专利，事实上业界对于该项操作有一个名字，叫做 DCE(dead code elemination) ，然而与其说 tree shaking 是 DCE 的一种实现，不如说 tree shaking 从另外一个思路达到了 DCE 的目的。

无用代码的减少意味着更小的代码体积，缩减 bundle size，从而获得更好的用户体验。

**如何实现 tree shaking？**

两个先决条件：

首先既然要实现的是减少浏览器下载的资源大小，因此要 tree shaking 的环境必然不能是浏览器，一般宿主环境是 Node；
其次，如果 JavaScript 是模块化的，那么必须遵从的是 ES 模块化规范，原因上面已经提到过了。

另外需要注意的是，对于单个文件和模块化来说 webpack 要实现 tree-shaking 必须依赖 uglifyJs。这里就不展开过多的阐述了，想了解更多内容可以阅读这篇文章[《Tree-Shaking 性能优化实践 - 原理篇》](https://juejin.im/post/5a4dc842518825698e7279a9)

目前各大浏览器早已在新版本中支持 ES 模块化了。如果我们想在浏览器中使用原生 ES 模块方案，只需要在 script 标签上添加一个 type="module"属性。通过该属性，浏览器知道这个文件是以模块化的方式运行的。

```js
<script type="module">import module1 from './module1'</script>
```

[模块化 —— CommonJS、AMD、UMD、ESM（上）](https://www.cnblogs.com/jfen625/p/12571675.html)
