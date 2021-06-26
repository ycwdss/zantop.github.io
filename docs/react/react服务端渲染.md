# react 服务端渲染

Context API 主要解决 props 向对层嵌套的子组件传递的问题(爷孙组件 props 传递)，原理是定义一个全局对象，通过订阅发布的方式进行数据的传递。

## 1、实现基础的 React 组件 SSR

### 1.1、 SSR vs CSR

安装`koa2/koa-router/nodemon` 直接 koa2 搭建个服务

```js
const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const backendRouter = new Router();
backendRouter.get('*', (ctx, next) => {
  console.log('url', ctx.url);
  const html = `
    <html>
      <head>
        <title>demo</title>
      </head>
      <body>
        <h1>Hello React SSR</h1>
      </body>
    </html>
  `;
  ctx.status = 200;
  ctx.type = 'html';
  ctx.body = html;
});
app.use(backendRouter.routes()).use(backendRouter.allowedMethods());
app.listen(3000, () => {
  console.log('listen:3000');
});
```

启动`nodemon sever`可以在浏览器看到有`hello world`直接查看源码可以看到
html 被输出

```html
<html>
  <head>
    <title>demo</title>
  </head>
  <body>
    <h1>Hello React SSR</h1>
  </body>
</html>
```

这就是服务端渲染。其实非常好理解，就是服务器返回一堆 html 字符串，然后让浏览器显示。  
与服务端渲染相对的是客户端渲染(Client Side Render)。那什么是客户端渲染？ 现在创建一个新的 React 项目，用脚手架生成项目，然后 run 起来。

然而打开网页源代码。body 中除了兼容处理的 noscript 标签之外，只有一个 id 为 root 的标签。那首页的内容是从哪来的呢？很明显，是下面的 script 中拉取的 JS 代码控制的。  
因此，CSR 和 SSR 最大的区别在于前者的页面渲染是 JS 负责进行的，而后者是服务器端直接返回 HTML 让浏览器直接渲染。  
为什么要使用服务端渲染呢？  
![](http://open.zantop.cn/react-ssr01.png)

传统 CSR 的弊端：

- 由于页面显示过程要进行 JS 文件拉取和 React 代码执行，首屏加载时间会比较慢。
- 对于 SEO(Search Engine Optimazition,即搜索引擎优化)，完全无能为力，因为搜索引擎爬虫只认识 html 结构的内容，而不能识别 JS 代码内容。

SSR 的出现，就是为了解决这些传统 CSR 的弊端。

### 1.2、实现 React 组件的服务端渲染

写个 react 组件

```js
// containers/Test.js
import React from 'react';
const Test = () => {
  return (
    <div>
      <div>Hello React SSR</div>
      <button
        onClick={() => {
          alert('666');
        }}
      >
        测试
      </button>
    </div>
  );
};
export default Test;
```

现在的任务就是将它转换为 html 代码返回给浏览器。  
总所周知，JSX 中的标签其实是基于虚拟 DOM 的，最终要通过一定的方法将其转换为真实 DOM。虚拟 DOM 也就是 JS 对象，可以看出整个服务端的渲染流程就是通过虚拟 DOM 的编译来完成的，因此虚拟 DOM 巨大的表达力也可见一斑了。

React 有针对服务端渲染对应的[api](https://zh-hans.reactjs.org/docs/react-dom-server.html#rendertostring)

- renderToString()
- renderToStaticMarkup()
- renderToNodeStream()
- renderToStaticNodeStream()

这里主要是借助`renderToString`把组件转换为字符串模板渲染出来

```js
const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const backendRouter = new Router();
import React from 'react';
import { renderToString } from 'react-dom/server';
import Test from '../containers/test';

const content = renderToString(<Test />);
backendRouter.get('*', (ctx, next) => {
  console.log('url', ctx.url);
  const html = `
    <html>
      <head>
        <title>demo</title>
      </head>
      <body>
        <h1>${content}</h1>
      </body>
    </html>
  `;
  ctx.status = 200;
  ctx.type = 'html';
  ctx.body = html;
});
app.use(backendRouter.routes()).use(backendRouter.allowedMethods());
app.listen(3000, () => {
  console.log('listen:3000');
});
```

启动服务，浏览器打开`http://localhost:3000/`可以看到 react 组件渲染到了页面上，查看源代码会看到源码。

## 2、初识同构

上面组件中给按钮加了点击事件，发现点了无反应，原因很简单，`react-dom/server`下的 renderToString 并没有做事件相关的处理，因此返回给浏览器的内容不会有事件绑定。
那怎么解决这个问题呢？  
这就需要进行同构了。所谓同构，通俗的讲，就是一套 React 代码在服务器上运行一遍，到达浏览器又运行一遍。服务端渲染完成页面结构，浏览器端渲染完成事件绑定。  
那如何进行浏览器端的事件绑定呢？  
唯一的方式就是让浏览器去拉取 JS 文件执行，让 JS 代码来控制。于是服务端返回的代码变成了这样:

![](http://open.zantop.cn/react-ssr02.png)

有没有发现和之前的区别？区别就是多了一个 script 标签。而它拉取的 JS 代码就是来完成同构的。
那么这个 index.js 我们如何生产出来呢？

在这里，要用到 react-dom。具体做法其实就很简单了：

```js
//client/index. js
import React from 'react';
import ReactDom from 'react-dom';
import Test from '../containers/test';

ReactDom.hydrate(<Test />, document.getElementById('root'));
```

[揭秘 React 服务端渲染](https://juejin.im/post/5af443856fb9a07abc29f1eb)
