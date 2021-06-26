# nextjs 服务端渲染

## 1、安装

1、自定义安装

```js
mkdir react-next
```

```js
yarn add  next react react-dom
```

目录下创建`pages/index.js`

```js
export default () => <div>Welcome to next.js!</div>;
```

`package.json`修改

```js
    "dev": "next",
    "build": " next build",
    "start": "next start"
```

执行`yarn dev` 打开`http://localhost:3000` 看到页面展示了内容，查看源码中也能看到`Welcome to next.js!`渲染了

2、脚手架 creact-next-app 安装

```js
yarn add global create-next-app
```

执行`create-next-app XXX`创建项目，`yarn dev` 运行项目。

## 2、样式

1、styled-jsx

```js
const Home = () => (
  <div>
    <Head>
      <title>Home</title>
    </Head>
    <div className="hero" style={{ color: 'red' }}>
      demo
    </div>
    <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
        text-align: center;
      }
    `}</style>
  </div>
);
export default Home;
//加入了Style jsx代码后 会随机生成一个类名 类似 jsx-xxx 防止css的全局污染
```

2、内联样式

```js
<div className="hero" style={{ color: 'red' }}>
  demo
</div>
```

3、 CSS / Sass / Less / Stylus files

以`sass`为例子：

```js
yarn add @zeit/next-sass node-sass
```

创建`next.config.js`自定义配置文件

```js
const withSass = require('@zeit/next-sass');
module.exports = withSass({
  cssLoaderOptions: {
    importLoaders: 1,
    localIdentName: '[local]_[hash:base64:5]',
  },
});
```

[next-sass](https://github.com/zeit/next-plugins/tree/master/packages/next-sass)

如果是配置多个插件时，可以安装[next-compose-plugins](https://github.com/cyrilwanner/next-compose-plugins)

```js
const withPlugins = require('next-compose-plugins');
const sass = require('@zeit/next-sass');
const less = require('@zeit/next-less');
const nextConfig = {
  distDir: 'build',
};
module.exports = withPlugins(
  [
    [
      sass,
      {
        cssModules: true,
        cssLoaderOptions: {
          importLoaders: 1,
          localIdentName: '[local]_[hash:base64:5]',
        },
      },
    ],
    [
      less,
      {
        cssModules: false,
      },
    ],
  ],
  nextConfig,
);
```

## 3、动态加载组件

```js
import dynamic from 'next/dynamic';

const DynamicComponentWithCustomLoading = dynamic(
  import('../components/hello2'),
  {
    loading: () => <p>...</p>,
  },
);
export default () => (
  <div>
    <Header />
    <DynamicComponentWithCustomLoading />
    <p>HOME PAGE is here!</p>
  </div>
);
```

## 4、自定义 App

```js
import App from 'next/app';
import React from 'react';

export default class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    //把App的props传入到自定义APPprops
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    return;
    <Component {...pageProps} />;
  }
}
```

## 5、获取数据以及组件生命周期

**getInitialProps**

getInitialProps 来获取外部资源，并把外部资源以 props 的方式传递给页面组件。
getInitialProps 将不能使用在子组件中,只能使用在 pages 页面中。

方式 1：

```js
Home.getInitialProps = async () = {...};
```

也可以在组件类中加上 static 关键字定义

方式 2：

```js
class Home extends React.Component {
  static async getInitialProps() {
     ...
  }
}
```

打印下`_app.js`中 `getInitialProps` 传递过来有哪些信息

```js
{ AppTree: [Function: AppTree],
  Component: [Function: Index],
  router:
   ServerRouter {
     route: '/',
     pathname: '/',
     query: [Object: null prototype] {},
     asPath: '/' },
  ctx:
   { err: undefined,
     req:
      IncomingMessage {
        _readableState: [ReadableState],
        readable: true,
        _events: [Object],
        _eventsCount: 1,
        _maxListeners: undefined,
        socket: [Socket],
        connection: [Socket],
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        httpVersion: '1.1',
        complete: true,
        headers: [Object],
        rawHeaders: [Array],
        trailers: {},
        rawTrailers: [],
        aborted: false,
        upgrade: false,
        url: '/',
        method: 'GET',
        statusCode: null,
        statusMessage: null,
        client: [Socket],
        _consuming: false,
        _dumped: false },
     res:
      ServerResponse {
        _events: [Object],
        _eventsCount: 1,
        _maxListeners: undefined,
        output: [],
        outputEncodings: [],
        outputCallbacks: [],
        outputSize: 0,
        writable: true,
        _last: false,
        chunkedEncoding: false,
        shouldKeepAlive: true,
        useChunkedEncodingByDefault: true,
        sendDate: true,
        _removedConnection: false,
        _removedContLen: false,
        _removedTE: false,
        _contentLength: null,
        _hasBody: true,
        _trailer: '',
        finished: false,
        _headerSent: false,
        socket: [Socket],
        connection: [Socket],
        _header: null,
        _onPendingData: [Function: bound updateOutgoingData],
        _sent100: false,
        _expect_continue: false,
        statusCode: 200,
        locals: {},
        flush: [Function: flush],
        write: [Function: write],
        end: [Function: end],
        on: [Function: on],
        writeHead: [Function: writeHead],
        [Symbol(isCorked)]: false,
        [Symbol(outHeadersKey)]: null },
     pathname: '/',
     query: [Object: null prototype] {},
     asPath: '/',
     AppTree: [Function: AppTree] } }
```

getInitialProps 入参 ctx 对象的属性如下：

- pathname - URL 的 path 部分
- query - URL 的 query 部分，并被解析成对象
- asPath - 显示在浏览器中的实际路径（包含查询部分），为 String 类型
- req - HTTP 请求对象 (只有服务器端有)
- res - HTTP 返回对象 (只有服务器端有)
- jsonPageRes - 获取数据响应对象 (只有客户端有)
- err - 渲染过程中的任何错误

获取数据示例：

```js
import axios from 'axios';

const About = ({ list }) => {
  return (
    <ul>
      {list.map((item, index) => (
        <li key={item.song_id}>
          {item.album_title}--{item.author}
        </li>
      ))}
    </ul>
  );
};
About.getInitialProps = async () => {
  const res = await axios.get(
    'https://www.mxnzp.com/api/music/recommend/list ',
  );

  return { list: res.data.data, title: '每日音乐推荐' };
};
export default About;
```

## 6、自定义错误

创建`pages/_error.js`文件,全局错误处理

```js
import React from 'react';

export default class Error extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;
    return { statusCode };
  }

  render() {
    return (
      <p>
        {this.props.statusCode
          ? `An error ${this.props.statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    );
  }
}
```

如果是内置页面错误，可以使用`next/error`

```js
import React from 'react';
import Error from 'next/error';
import fetch from 'isomorphic-unfetch';

export default class Page extends React.Component {
  static async getInitialProps() {
    const res = await fetch('https://api.github.com/repos/zeit/next.js');
    const statusCode = res.statusCode > 200 ? res.statusCode : false;
    const json = await res.json();

    return { statusCode, stars: json.stargazers_count };
  }

  render() {
    if (this.props.statusCode) {
      return <Error statusCode={this.props.statusCode} />;
    }

    return <div>Next stars: {this.props.stars}</div>;
  }
}
```

## 7、路由

1、Link

必须包裹元素，只能有唯一节点。

引入`import Link from 'next/link'`

```js
<Link href="/about">
  <a>about</a>
</Link>;

// pages/about.js
export default () => <p>Welcome to About!</p>;
```

可以使用`Link prefetch`s 使链接和预加载在后台同时进行，来达到页面的最佳性能。

2、传参

```js
<Link href={{ pathname: '/about', query: { name: 'Zeit' } }}>
  <a>about</a>
</Link>
```

将生成 URL 字符串/about?name=Zeit，

```html
<Link href="/about" replace>会替换当前路由</Link>
```

3、事件

```js
//如果你不提供<a>标签，只会处理onClick事件而href将不起作用
<li onClick={handleJump}>路由</li>;
Router.push({
  pathname: '/about',
  query: { name: 'Zeit' },
});
```

4、withRouter 高阶组件

接收参数

```js
import { withRouter } from 'next/router';
const About = ({ router }) => <div>关于我们:{router.query.name}</div>;

export default withRouter(About);
```

5、路由映射

不想参数暴露在路由中，next Link 组件提供的 as 属性

```js
<Link href={{ pathname: '/about', query: { name: 'Zeit' } }} as="/a">
  <a>路由</a>
</Link>;
//或者
Router.push(
  {
    pathname: '/about',
    query: { name: 'Zeit' },
  },
  '/a',
);
```

但是刷新会出现 404 因为 pages 目录下没有这个文件
解决方法：  
 使用路由映射跳转的时候，需要使用 koa 进行相关的拦截，然后更新服务端的路径

```js
// server.js

const Koa = require('koa');
const Router = require('koa-router');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3001;
// 等到pages目录编译完成后启动服务响应请求
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  router.get('/about/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log('哈哈');
    console.log(ctx.params);
    await handle(ctx.req, ctx.res, {
      pathname: '/about',
      query: {
        id,
      },
    });
    ctx.respond = false;
  });
  server.use(router.routes());
  // end
  server.use(async (ctx, next) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
  });

  server.listen(PORT, () => {
    console.log(`koa server listening on ${PORT}`);
  });
});
```

**package.json**

```js
 "dev": "node server/index.js",
```

6、钩子

- routeChangeStart(url) - 路由开始切换时触发
- routeChangeComplete(url) - 完成路由切换时触发
- routeChangeError(err, url) - 路由切换报错时触发
- beforeHistoryChange(url) - 浏览器 history 模式开始切换时触发
- hashChangeStart(url) - 开始切换 hash 值但是没有切换页面路由时触发
- hashChangeComplete(url) - 完成切换 hash 值但是没有切换页面路由时触发
  这里的 url 是指显示在浏览器中的 url。如果你用了 Router.push(url, as)（或类似的方法），那浏览器中的 url 将会显示 as 的值。

```js
//如何正确使用路由事件routeChangeStart的例子：
const handleRouteChange = (url) => {
  console.log('App is changing to: ', url);
};

Router.events.on('routeChangeStart', handleRouteChange);
//如果你不想长期监听该事件，你可以用off事件去取消监听：
Router.events.off('routeChangeStart', handleRouteChange);
//如果路由加载被取消（比如快速连续双击链接）
Router.events.on('routeChangeError', (err, url) => {
  if (err.cancelled) {
    console.log(`Route to ${url} was cancelled!`);
  }
});
```

## 8、数据管理

安装

```js
next - redux - wrapper;
next - redux - saga;
react - redux;
redux;
```

```js
import React from 'react';
import App from 'next/app';
import Layout from '../components/layout';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga';
import { Provider } from 'react-redux';
import createStore from '../store';
import 'antd/dist/antd.css';
class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    return { pageProps };
  }
  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Layout title={pageProps.title}>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    );
  }
}
export default withRedux(createStore)(withReduxSaga(MyApp));
```

`redux-thunk` `redux-saga` 跟客户端渲染使用方式一样

[nextjs 文档](https://www.cnblogs.com/mybilibili/p/11722302.html)  
[一文吃透 React SSR 服务端渲染和同构原理](https://juejin.im/post/5d7deef6e51d453bb13b66cd)
