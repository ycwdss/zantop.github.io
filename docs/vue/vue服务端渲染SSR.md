# vue服务端渲染SSR

## 基本用法

安装

```js
npm install vue vue-server-renderer koa --save
```

基本现实

```js
//根目录 server.js
const Koa = require("koa");
const app = new Koa();
// 第 1 步：创建一个 Vue 实例
const Vue = require("vue");
const vueApp = new Vue({
  template: `<div>Hello World</div>`
});
// 第 2 步：创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer();
// 第 3 步：将 Vue 实例渲染为 HTML
app.use(async (ctx, next) => {
  renderer
    .renderToString(vueApp)
    .then(html => {
      ctx.body = `
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>${html}</body> 
      </html>
      `;
    })
    .catch(err => {
      console.error(err);
    });
});
app.listen(3000, () => console.log("3000 port is running"));
```

在浏览器中审查元素，可以看到页面源码,

```html
 <!DOCTYPE html>
   <html lang="en">
        <head><title>Hello</title></head>
        <body><div data-server-rendered="true">Hello World</div></body>
   </html>
```

## 模板

### 创建模板

创建 src/index.html 模板

```html
<!DOCTYPE html>
<html lang="en">
  <head><title>Hello</title></head>
  <body>
    <!--vue-ssr-outlet-->
  </body>
</html>
```

注意 <!--vue-ssr-outlet--> 注释 -- 这里将是应用程序 HTML 标记注入的地方。

```js
const Koa = require("koa");
const app = new Koa();
// 第 1 步：创建一个 Vue 实例
const Vue = require("vue");
const vueApp = new Vue({
  template: `<div>hello world</div>`
});
// 第 2 步：创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync("./src/index.html", "utf-8")
});
// 第 3 步：将 Vue 实例渲染为 HTML
app.use(async (ctx, next) => {
  renderer
    .renderToString(vueApp)
    .then(html => {
      ctx.body = html;
    })
    .catch(err => {
      console.error(err);
    });
});
app.listen(3000, () => console.log("3000 port is running"));
```

vue 创建实例 vueApp 的 template 会直接插入到模板<!--vue-ssr-outlet-->的地方。

### 模板插值

可以在模板 index.html 中创建插值

```html
 <title>{{ title }}</title>
```

创建 context 对象，作为 renderToString 函数的第二个参数

```js
const context = {
  title: "vue服务端渲染"
};
renderer
  .renderToString(vueApp, context)
  .then(html => {
    ctx.body = html;
  })
  .catch(err => {
    console.error(err);
  });
```

会看到页面的 title 改变为了`vue服务端渲染`,也可以注入页面的`meta`等

## 工厂函数

如果我们在多个请求之间使用一个共享的实例`vueApp`，很容易导致交叉请求状态污染,所以每个请求创建一个新的根 Vue 实例。

```js
//src目录 app.js 创建工厂函数
const Vue = require("vue");
module.exports = function createApp(context) {
  return new Vue({
    data: {
      url: context.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  });
};
```

我们也可以在工厂函数中注入 router、store 和 event bus 实例。

```js
//server.js
const Koa = require("koa");
const app = new Koa();
const createApp = require("./src/app");

const renderer = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync("./src/index.html", "utf-8")
});
app.use(async (ctx, next) => {
  const contextApp = {
    url: ctx.url
  };
  //上下文对象
  const context = {
    title: "vue服务端渲染"
  };
  //vue实例
  const vueApp = createApp(contextApp);
  renderer
    .renderToString(vueApp, context)
    .then(html => {
      ctx.body = html;
    })
    .catch(err => {
      console.error(err);
    });
});
app.listen(3000, () => console.log("3000 port is running"));
```

## 搭建环境

![tui](https://cloud.githubusercontent.com/assets/499550/17607895/786a415a-5fee-11e6-9c11-45a2cfdf085c.png)

从图上可以看出，ssr 有两个入口文件，client-entry.js 和 server-entry.js， 都包含了应用代码，webpack 通过两个入口文件分别打包成给服务端用的 `server bundle` 和给客户端用的`client bundle`.

当服务器接收到了来自客户端的请求之后，会创建一个渲染器 `bundleRenderer`，这个 `bundleRenderer` 会读取上面生成的 `server bundle` 文件，并且执行它的代码， 然后发送一个生成好的 html 到浏览器，等到客户端加载了 client bundle 之后，会和服务端生成的 DOM 进行 Hydration(判断这个 DOM 和自己即将生成的 DOM 是否相同，如果相同就将客户端的 vue 实例挂载到这个 DOM 上， 否则会提示警告)。

1. 创建一个 vue 实例
2. 配置路由，以及相应的视图组件
3. 创建客户端入口文件
4. 创建服务端入口文件
5. 配置 webpack，分服务端打包配置和客户端打包配置
6. 创建服务器端的渲染器，将 vue 实例渲染成 html

### 创建 vue 实例

暴露一个可以重复执行的工厂函数，为每个请求创建新的应用程序实例

```js
//  app.js
import Vue from "vue";
import App from "./App.vue";
import createRouter from "./router";

Vue.config.productionTip = false;

export function createApp() {
  const router = createRouter();
  const app = new Vue({
    router,
    render: h => h(App)
  });
  return { app, router };
}
```

### 配置路由

类似于 createApp，我们也需要给每个请求一个新的 router 实例，所以文件导出一个 createRouter 函数.

```js
//vue-router/index.js
import Vue from "vue";
import Router from "vue-router";
import home from "./view/home";
import about from "./view/about";

Vue.use(Router);
export default function createRouter() {
  return new Router({
    mode: "history",
    routes: [
      {
        path: "/",
        name: "home",
        component: home
      },
      {
        path: "/about",
        name: "about",
        component: about
      }
    ]
  });
}
```

### 客户端入口文件

`entry-client.js` 客户端 entry 只需创建应用程序，并且将其挂载到`DOM`中

```js
import { createApp } from "./app";

// 客户端特定引导逻辑……

const { app, router } = createApp();

// 这里假定 App.vue 模板中根元素具有
router.onReady(() => {
  app.$mount("#app");
});
```

### 服务端入口文件

`entry-server.js` 中实现服务器端路由逻辑

```js
import { createApp } from "./app";

export default context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，
  // 就已经准备就绪。
  return new Promise((resolve, reject) => {
    const { app, router } = createApp(context);

    // 设置服务器端 router 的位置
    router.push(context.url);

    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();

      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        return reject({ code: 404 });
      }

      resolve(app);
    });
  });
};
```

### 配置 webpack

```js
├── build
│   ├── setup-dev-server.js  # 设置 webpack-dev-middleware 开发环境
│   ├── webpack.base.config.js # 基础通用配置
│   ├── webpack.client.config.js  # 编译出 vue-ssr-client-manifest.json 文件和 js、css 等文件，供浏览器调用
│   └── webpack.server.config.js  # 编译出 vue-ssr-server-bundle.json 供 nodejs 调用
```

需要配置 webpack，来生成服务端用的 server bundle 和给客户端用的 client bundle。

`webpack.base.config.js`

```js
//webpack.base.config.js
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
module.exports = {
  mode: "development",
  //出口文件配置
  output: {
    //打包的路径
    path: path.resolve(__dirname, "../dist"),
    //打包的文件名称
    filename: "[name].[hash:8].js",
    //公共路径
    publicPath: ""
  },
  //公共模块
  module: {
    rules: [
      //  使用vue-loader 加载 .vue 结尾的文件
      {
        test: /\.vue$/,
        loader: "vue-loader",
        exclude: /node_modules/
      },
      //babel语法转换规则
      //npm i babel-loader babel-core babel-preset-env babel-preset-react -D
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        //file-loader 解决css等文件中引入图片路径的问题
        // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: {
          loader: "url-loader",
          options: {
            outputPath: "assets/images/", // 图片输出的路径
            name: "[name].[hash:8].[ext]",
            limit: 5 * 1024
          }
        }
      },
      //加载字体图标
      {
        test: /\.(woff|woff2|svg|eot|ttf|otf)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            name: "assets/fonts/[name].[hash:8].[ext]"
          }
        }
      },
      // npm i sass-loader node-sass css-loader style-loader postcss-loader autoprefixer -D
      {
        test: /\.(sa|sc|c)ss$/,
        include: path.resolve(__dirname, "./../src"),
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("autoprefixer")({
                  browsers: [
                    "last 30 versions",
                    "> 2%",
                    "Firefox >= 10",
                    "ie 6-11"
                  ]
                })
              ]
            }
          }
        ]
      }
    ]
  },
  //插件
  plugins: [
    //加载vue
    new VueLoaderPlugin()
  ],
  //后缀名自动补全
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
      vue$: "vue/dist/vue.js" //设置vue的别名
    },
    extensions: [".js", ".jsx", ".vue", ".less", ".scss", ".css"]
  }
};
```

`webpack.client.js`

```js
//webpack.client.js
const path = require("path");
const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");
const webpackConfigBase = require("./webpack.base.config");

const webpackConfigDev = {
  entry: {
    app: "./src/entry-client.js"
  },
  //插件
  plugins: [
    new webpack.optimize.SplitChunksPlugin({
      minChunks: Infinity,
      name: "manifest"
    }),
    new VueSSRClientPlugin()
  ]
};

module.exports = webpackMerge(webpackConfigBase, webpackConfigDev);
```

`webpack.server.config.js`

```js
//webpack.server.config.js
const webpackMerge = require("webpack-merge");
const nodeExternals = require("webpack-node-externals");
const webpackConfigBase = require("./webpack.base.config");
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");

const webpackConfigProd = {
  entry: "./src/entry-server.js",
  devtool: "source-map",
  target: "node",
  output: {
    filename: "server-bundle.js",
    libraryTarget: "commonjs2"
  },
  externals: [
    nodeExternals({
      // do not externalize CSS files in case we need to import it from a dep
      whitelist: /\.css$/
    })
  ],
  plugins: [new VueSSRServerPlugin()]
};
module.exports = webpackMerge(webpackConfigBase, webpackConfigProd);
```

`package.json`

```json
{
  "name": "vue-ssr",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon server",
    "build:client": "webpack --config=build/webpack.client.config.js --hide-modules",
    "build:server": "webpack --config=build/webpack.server.config.js --hide-modules",
    "build": "rimraf dist && npm run build:client && npm run build:server"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "autoprefixer": "^9.1.5",
    "babel-core": "^6.26.3",
    "babel-loader": "^7.1.5",
    "babel-preset-env": "^1.7.0",
    "css-loader": "^1.0.0",
    "koa": "^2.5.3",
    "node-sass": "^4.9.3",
    "nodemon": "^1.18.4",
    "postcss-loader": "^3.0.0",
    "rimraf": "^2.6.2",
    "sass-loader": "^7.1.0",
    "style-loader": "^0.23.0",
    "url-loader": "^1.1.1",
    "vue": "^2.5.17",
    "vue-loader": "^15.4.2",
    "vue-router": "^3.0.1",
    "vue-server-renderer": "^2.5.17",
    "vue-template-compiler": "^2.5.17",
    "vuex-router-sync": "^5.0.0",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.1",
    "webpack-merge": "^4.1.4",
    "webpack-node-externals": "^1.7.2"
  },
  "dependencies": {}
}
```

### 服务端渲染

```js
const Koa = require("koa");
const app = new Koa();
const koaStatic = require("koa-static");
const fs = require("fs");
const path = require("path");
const resolve = file => path.resolve(__dirname, file);
// 开放dist目录，引入js css
app.use(koaStatic(resolve("./dist")));

const { createBundleRenderer } = require("vue-server-renderer");
const template = fs.readFileSync("./src/index.html", "utf-8");
const serverBundle = require("./dist/vue-ssr-server-bundle.json");
const clientManifest = require("./dist/vue-ssr-client-manifest.json");

const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template,
  clientManifest
});

function renderToString(context) {
  return new Promise((resolve, reject) => {
    renderer.renderToString(context, (err, html) => {
      err ? reject(err) : resolve(html);
    });
  });
}

app.use(async (ctx, next) => {
  const context = {
    title: "vue服务端渲染",
    url: ctx.url
  };
  // 将 context 数据渲染为 HTML
  const html = await renderToString(context);
  ctx.body = html;
});
app.listen(5100, () => console.log("5100 port is running"));
```

我们直接运行`npm run build`后生成了服务端用的 server bundle 和给客户端用的 client bundle，在`npm run dev`, `createBundleRenderer`会读取上面生成的 server bundle 文件，并且执行它的代码， 然后发送一个生成好的 html 到浏览器

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>vue服务端渲染</title>
<link rel="preload" href="/app.9cc22869.js" as="script"></head>
<body>
  <div id="app" data-server-rendered="true"><a href="/" class="link router-link-exact-active router-link-active">首页</a> <a href="/about" class="link">关于</a> <div class="container">
  首页
</div></div><script src="/app.9cc22869.js" defer></script>
  <script src="dist/app.76c024a3.js"></script>
</body>
</html>
```

### css 样式

安装[`vue-style-loader`](https://github.com/vuejs/vue-style-loader)来替代`style-loader`,前者具备一些服务器端渲染的特殊功能，如在使用 bundleRenderer 时，自动注入页面 head。

分离压缩 css 样式：

安装`cross-env`插件，在`package.json`配置

```js
//开发环境 也可以在配置开发环境
"build:client": "cross-env NODE_ENV=production  webpack --config=build/webpack.client.config.js --hide-modules",
"build:server": "cross-env NODE_ENV=production  webpack --config=build/webpack.server.config.js --hide-modules",
```

```js
const isPro = process.env.NODE_ENV === 'production'; //是否为生产环境
//安装 css分离 mini-css-extract-plugin css压缩optimize-css-assets-webpack-plugin
//css loader配置如下
 isPro ? MiniCssExtractPlugin.loader : 'vue-style-loader',
//....

//插件
    plugins: [
        //加载vue
        new VueLoaderPlugin(),
        //分离css
        new MiniCssExtractPlugin({
            filename: '[name].[hash:8].css',
            chunkFilename: '[id].[hash:8].css',
        }),
        //压缩css
        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),
    ],
```

运行`npm run build`,可以看到 css 分离出来了

![ssrcss](/img/ssrcss.png =180x110)

运行`npm run dev`，可以看到

![ssrcss1](/img/ssrcss1.png =380x100)

### vuex 状态管理

```js
// src/store/index.js
import Vue from "vue";
import Vuex from "vuex";
import actions from "./actions";
import mutations from "./mutations";

Vue.use(Vuex);

// 假定我们有一个可以返回 Promise 的
// 通用 API（请忽略此 API 具体实现细节）

export default function createStore() {
  return new Vuex.Store({
    state: {
      list: {}
    },
    actions,
    mutations
  });
}
```

其中 actions 和 mutations 我单独封装了一个 js

```js
//  actions.js
import axios from "axios";
export default {
  fetchItem({ commit }) {
    return axios
      .get("http://mapi.itougu.jrj.com.cn/xlive_poll/getLastNotice")
      .then(function(response) {
        commit("setItem", response.data);
      });
  }
};
```

```js
// mutations.js
export default {
  setItem(state, data) {
    state.list = data;
  }
};
```

[github vue-ssr](https://github.com/zantop/vue-ssr-demo-1)

[带你五步学会 Vue SSR](https://juejin.im/post/5bbda9ed5188255c8f06c0dc)
