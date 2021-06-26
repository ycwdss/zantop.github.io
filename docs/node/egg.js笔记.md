# egg.js 笔记

## 1、工程目录结构

首先，egg 实际上是继承于 koa 的，egg 在 koa 的基础上制定了很多约定和规范，扩展性也很高。但是有的地方必须遵循这些约定和规范，比如目录结构：

```
egg-project
├── package.json
├── app.js (可选) // 用于自定义启动时的初始化工作，可选，具体参见启动自定义。关于agent.js的作用参见Agent机制
├── agent.js (可选) // 同上
├── app
|   ├── router.js // 用于配置 URL 路由规则，具体参见 Router
│   ├── controller // 用于解析用户的输入，处理后返回相应的结果，具体参见 Controller
│   |   └── home.js
│   ├── service (可选) // 用于编写业务逻辑层，可选，建议使用，具体参见 Service
│   |   └── user.js
│   ├── middleware (可选) // 用于编写中间件，可选，具体参见 Middleware
│   |   └── response_time.js
│   ├── schedule (可选) // 用于定时任务，可选，具体参见定时任务
│   |   └── my_task.js
│   ├── public (可选) // 用于放置静态资源，可选，具体参见内置插件 egg-static
│   |   └── reset.css
│   ├── view (可选) // 用于放置模板文件，可选，由模板插件约定，具体参见模板渲染
│   |   └── home.tpl
│   └── extend (可选) // 用于框架的扩展，可选，具体参见框架扩展
│   |   ├── helper.js (可选)
│   |   ├── request.js (可选)
│   |   ├── response.js (可选)
│   |   ├── context.js (可选)
│   |   ├── application.js (可选)
│   |   └── agent.js (可选)
|   └── model (可选) // 用于放置领域模型，可选，由领域类相关插件约定，如 egg-sequelize
├── config // 用于编写配置文件，具体参见配置
|   ├── plugin.js // 用于配置需要加载的插件，具体参见插件开发
|   ├── config.default.js
│   ├── config.prod.js
|   ├── config.test.js (可选)
|   ├── config.local.js (可选)
|   └── config.unittest.js (可选)
└── test // 用于单元测试，具体参见单元测试
    ├── middleware
    |   └── response_time.test.js
    └── controller
        └── home.test.js
```

## 2、内置对象

既然是基于 koa 那肯定支持 koa 的内置对象，包括：Application, Context, Request, Response；同时，扩展的对象有：Controller, Service, Helper, Config, Logger。

## 3、运行环境与配置

### 1、在应用内获取环境

应用内，可以使用 app.config.env 来获取当前的运行环境

注意点：

- 1）在 Egg 中，细分了运行环境，它使用的是 EGG_SERVER_ENV 这一环境变量，其可细分为：local/unittest/prod 等模式
- 2）当未指定 EGG_SERVER_ENV 时，框架也会自动获取 NODE_ENV 并转成 EGG_SERVER_ENV
- 3）Koa 中区分环境使用的是 app.env（而 app.env 值取决于 process.env.NODE_ENV），所以在 Egg 中，不再使用 app.env 区分环境
- 4）EGG_SERVER_ENV 可以支持更多的自定义环境变量，应用启动时，便会自动加载 config/config.[EGG_SERVER_ENV].js 文件

### 2、配置

其中，config.default.js 为默认配置文件，会被任何环境下加载，而指定了 EGG_SERVER_ENV 后，则会自动加载对应的配置文件，然后覆盖默认配置文件中的同名配置
编写配置文件的方式如下：

```js
// config/config.local.js
module.exports = {
  // ...
};
// 也可以返回一个函数
module.exports = (appInfo) => {
  return {
    // ...
  };
};
// 也可以使用exports快捷方式，但是exports不能赋值一个新的引用
exports.keys = '...';
exports.logger = {
  // ...
};
```

Egg 中可以同时有多份配置文件，这些配置文件会根据具体运行环境进行自动合并、整合，如一个 Egg 应用可以有如下的配置文件：

其中，当配置文件返回一个函数时，调用时会被自动注入参数 appInfo，而 appInfo 拥有如下属性：

```js
config
├── config.default.js
├── config.test.js
├── config.prod.js
├── config.unittest.js
└── config.local.js
```

```js
appInfo.pkg package.json
appInfo.name 应用名称，相当于appInfo.pkg.name
appInfo.baseDir 应用代码的目录
appInfo.HOME 用户目录，如admin账户为/home/admin
appInfo.root 应用根目录，在local/unittest下相当于baseDir，其他情况下则为HOME
```

### 3、配置加载的优先级与合并规则

配置的加载，遵循优先级：应用 > 框架 > 插件，运行环境 > 默认配置，如下：

```js
 插件 config.default.js
< 框架 config.default.js
< 应用 config.default.js
< 插件 config.prod.js
< 框架 config.prod.js
< 应用 config.prod.js
```

而在合并上，则使用 extend2 模块进行深度拷贝，extend2 虽然继承自 extend，但在数组拷贝行为上是直接覆盖而非合并：

```js
extend(
  true,
  {
    arr: [1, 2],
  },
  {
    arr: [3],
  },
);
// 结果为：{ arr: [3] }
```

如果要对合并后的最终结果进行分析，则可以查看 run 目录下的文件，其中 worker 进程下对应 application_config.json 文件，而 agent 进程下对应 agent_config.json 文件
但是文件中会隐藏密码、密钥、函数、Buffer 等类型的字段
此外，还可以通过 application_config_meta.json/agent_config_meta.json 文件来排查属性的来源

## 4、app.js

在根目录映入眼帘的是一个 app.js，首先它并不是像大多数前端框架中的一个入口文件，在 egg 中这个 app.js 是用来做一些初始化的工作，甚至可以没有这个 app.js 文件，所以它是`可选的`。

那这个 app.js 我们可以来做一些什么事呢？上面说的 `Application` 是全局应用对象，在一个应用中，只会实例化一个，贯穿整个应用。我们可以在启动时做一些自定义的动作，比如监听以及在 `Application` 上挂载一下属性或方法，就像这样：

```js
// app.js
module.exports = (app) => {
  // 自定义内容
  app.projectName = 'eggManual';

  app.beforeStart(async () => {
    // 应用会等待这个函数执行完成才启动
    console.log('==app beforeStart==');
  });

  app.ready(async () => {
    console.log('==app ready==');
  });

  app.beforeClose(async () => {
    console.log('==app beforeClose==');
  });
};
```

启动时，控制台结果如下:

```js
2018-11-08 09:27:02,236 INFO 47654 [master] node version v10.8.0
2018-11-08 09:27:02,238 INFO 47654 [master] egg version 2.12.0
2018-11-08 09:27:02,815 INFO 47654 [master] agent_worker#1:47655 started (574ms)
==app beforeStart==
==app ready==
2018-11-08 09:27:03,561 INFO 47654 [master] egg started on http://127.0.0.1:7001 (1322ms)
```

这里的 app 就是 Application 对象，会在其他位置以参数或者 this 获取到。

## 5、路由 router.js

上面我们说要写一个服务，那请求的 URL 如何定义？答案就是在`router.js`中。它里面定义了我们的路由规则，所有的请求都会通过这个路由规则去找对应的`Controller`，这样也可以做到统一管控。
接着我们定义一个服务请求的 URL：

### 1、基本使用

`app/router.js`里面定义 URL 路由规则

```js
// app/router.js
module.exports = (app) => {
  const { router, controller } = app;
  router.get('/user/:id', controller.user.info);
};
```

`app/controller` 目录下面实现 Controller

```js
// app/controller/user.js
class UserController extends Controller {
  async info() {
    const { ctx } = this;
    ctx.body = {
      name: `hello ${ctx.params.id}`,
    };
  }
}
```

当用户在浏览器中输入`http://127.0.0.1:7001/user/123`,可以看到返回了个 json

```json
{
  "name": "hello 123"
}
```

### 2、详细定义

路由完整定义主要包括 5 个主要部分:

```js
router.verb('router-name', 'path-match', middleware1, ..., middlewareN, app.controller.action
```

- **verb** --在上面只是一个占位符，实际上 verb 表示的是触发的动作（即`HTTP 的请求方法`），即可有 `head/options/get/put/post/patch/delete` 这些值，还有 del(由于 delete 是保留字，所以这个是 delete 方法的别名)和 redirect 这些值
- **router-name** --给路由设定`一个别名`，可以通过 Helper 提供的辅助函数 pathFor 和 urlFor 来生成 URL
- **path-match** --路由 URL 路径
- **middleware** --路由里相应加载的中间件
- **controller** --映射的控制器，可以通过 app.controller 对象获取，也可以是一个字符串，如'user.info'（相当于 app.controller.user.info)

注意：

1. Router 中可支持多个 middleware 串联执行
2. Controller 必须定义在 app/controller 中，但一个文件其实可以支持多个 Controller（路由中可以通过${fileName}.${functionName}的方式指定），同时 Controller 也支持子目录（通过${directoryName}.${fileName}.\${functionName}指定）

根据不用场景，自定义路由

```js
router.verb('path-match', app.controller.action);
router.verb('router-name', 'path-match', app.controller.action);
router.verb('path-match', middleware1, ..., middlewareN, app.controller.action);
router.verb('router-name', 'path-match', middleware1, ..., middlewareN, app.controller.action);
```

对应的路由

```js
// app/router.js
module.exports = (app) => {
  const { router, controller } = app;
  router.get('/user/:id', controller.user.page);
  router.get('user', '/user/:id', controller.user.page);
  router.get('/user/:id', isLoginUser, hasUserPermission, controller.user.page);
  router.get('user', '/user/:id', isLoginUser, controller.user.page);
  router.post('/api/v1/comments', controller.v1.comments.create); // app/controller/v1/comments.js
};
```

### 3、RESTful 风格

[如何给老婆解释什么是 RESTful](https://zhuanlan.zhihu.com/p/30396391)

Egg 中，也对 RESTful 进行了支持，其关键在于使用`router.resources('routerName', 'pathMatch', controller)`方法生成可以支持 CRUD 的路由结构，如下：

```js
// app/router.js
module.exports = (app) => {
  const { router, controller } = app;
  router.resources('posts', '/api/posts', controller.posts);
  router.resources('users', '/api/v1/users', controller.v1.users);
};
```

由于`router.resources()`帮我们自动生成了 CRUD 路径结构，那么我们只要在 Controller 里实现相应方法（new,show,edit,create,update,destory），

如
`router.resources('posts', '/api/posts', controller.posts)`，会生成以下的结构：

```js
GET /posts -> app.controller.posts.index
GET /posts/new -> app.controller.posts.new
GET /posts/:id -> app.controller.posts.show
GET /posts/:id/edit -> app.controller.posts.edit
POST /posts -> app.controller.posts.create
PUT /posts/:id -> app.controller.posts.update
DELETE /posts/:id -> app.controller.posts.destory
```

若不需要某些方法，则可以不用实现，并且对应的路由也不会注册到 Router 里
![](https://image-static.segmentfault.com/164/825/1648259732-5aae7ea10a571)

### 4、router 实战

1.获取参数

要获取参数，有三种方法：`查询字符串`、`命名参数`和`正则`，其中，查询字符串方式可以使用`ctx.query`对象获取，命名参数则通过`ctx.params`对象获取。如下：

```js
// app/router.js
module.exports = (app) => {
  app.router.get('/user/:id/:name', app.controller.user.info); // id和name都是命名参数，使用ctx.params.id,ctx.params.name方式获取
  app.router.get('/search', app.controller.search.index); // 对于search?name=xxx，使用ctx.query.name获取
};
```

在正则方式中，捕获的参数则会存放在 ctx.params 里

2.表单参数

表单参数的获取，可以通过 ctx.request.body 获取，如:

```js
// app/controller/user.js
exports.post = async (ctx) => {
  ctx.body = `Body: ${JSON.stringify(ctx.request.body)}`;
};
```

3.表单校验

表单的校验，可以使用 ctx.validate()方法校验，当校验出错时，会抛出错误，实例如下：

```js
// app/router.js
module.exports = (app) => {
  app.router.post('/user', app.controller.user);
};

// app/controller/user.js
const createRule = {
  username: {
    type: 'email',
  },
  password: {
    type: 'password',
    compare: 're-password',
  },
};

exports.create = async (ctx) => {
  ctx.validate(createRule);
  ctx.body = ctx.request.body;
};
```

4.重定向

重定向，分为内部重定向（使用`router.redirect(fromPath, toPath, httpCode)`）和外部重定向（在应用内使用`ctx.redirect(url)`进行重定向）

## 6、控制器（Controller）

Controller 负责解析用户的输入、处理后返回相应的结果，一般情况下有：  
1）在 RESTful 中，Controller 接受用户的参数，从数据库中查找内容返回给用户、把用户请求更新到数据库中  
2）在 HTML 页面请求中，Controller 根据用户访问不同的 URL，渲染不同的模板给用户  
3）在代理服务器中，Controller 将用户请求转发到其他服务器上，并将其他服务器的处理结果返回给用户

**在 Egg 中，一般 Controller 层主要做的事情是对用户的请求参数进行处理，然后调用 Service 处理业务，得到结果后处理返回**

- controller 目录是可以支持多级的，比如 controller 目录下有个 v1 的文件夹，v1 文件夹下有个 main.js 文件，那么路由配置里面就可以写”controller.v1.main.show”，以此类推。

### 1、编写 Controller

在 Egg 中，编写 Controller 方式有两种：`class方式`和`导出方法`方式，其中主要推荐使用`class方式`。controller 文件，都放置于 app/controller 下，可以支持多级目录：

```js
const { Controller } = require('egg');
class SomeController extends Controller {
  async someMethod() {
    // ...
  }
}
module.exports = SomeController;
```

编写完`Controller`后，`router`中便可通过`app.controller`对象进行访问。此外，在每一个新请求达到 server 时，便会实例化一个全新的 Controller 对象，会有如下的属性挂载在 this 上：

- `this.ctx` 当前请求上下文中的 `Context` 实例
- `this.app` 当前应用的 `Application` 实例，可以拿到框架提供的全局对象、方法
- `this.service` 访问 `Service` 的接口，等价于 `this.ctx.service`
- `this.config` 运行配置
- `this.logger` 日志记录对象，分为四个级别（`debug`、`info`、`warn`、`error`）

另一种编写 controller 的方法是导出 Controller 方法，导出的每个方法都是 async 函数，不推荐这种写法，如：

```js
// app/controller/posts.js
exports.create = async (ctx) => {
  // ...
};
```

### 2、编写 Controller 基类

可以针对特定业务场景对 Controller 进行进一步抽象，编写 Controller 基类，如下：

```js
// app/core/base_controller.js
const { Controller } = require('egg');
class BaseController extends Controller {
  get user() {
    return this.ctx.session.user;
  }

  success(data) {
    this.ctx.body = {
      success: true,
      data,
    };
  }

  notFound(msg) {
    msg = msg || 'not found';
    this.ctx.throw(404, msg);
  }
}
module.exports = BaseController;
```

此时在编写应用的 Controller 时，可以继承 BaseController，直接使用基类上的方法：

```js
//app/controller/post.js
const Controller = require('../core/base_controller');
class PostController extends Controller {
  async list() {
    const posts = await this.service.listByUser(this.user);
    this.success(posts);
  }
}
```

### 3、获取请求参数

获取参数主要有两种：`查询字符串`和`路由参数`，这两种方法在`router` 里已经进行了介绍。在查询字符串这种方式中，Egg 中支持以下两种方法获取：

`ctx.query` 这种方式只取 key 第一次出现的值，不会进行合并，即：`name=Tom&name=Jack` 中 `ctx.query.name` 返回的是 `Tom`
`ctx.queries` 则支持重复的 key，重复的 key 会合并成一个数组，即：`name=Tom&name=Jack` 中 `ctx.queries.name` 返回`['Tom', 'Jack']`

### 4、获取 body

由于浏览器对 URL 的长度有所限制，且一些敏感数据也不宜通过 URL 传递，那么这种情况下，选择使用 body 传递数据是一种好的选择。  
在 HTTP 中，通常是在`POST、PUT、DELETE`方法中才使用 body 传递数据。框架内置了 bodyParser 中间件，会帮助进行以下解析操作：

- 根据请求的 Content-Type 进行解析。值为`application/json`、`application/json-patch+json`、`application/vnd.api+json`、`application/csp-report`时，按照`JSON`进行解析，默认情况下限制最大长度为 100kb；而值为`application/x-www-form-urlencoded`时，按照`Form格式`进行解析，默认情况下限制 body 最大长度为 100kb
- 若解析成功，body 一定会是一个 Object/Array（解析失败则抛出 400 异常）
- 若要调整默认的最大长度限制（超过时用户请求会返回 413 状态码），则可在 config/config.default.js 里进行覆盖修改：

```js
module.exports = {
  bodyParser: {
    jsonLimit: '1mb',
    formLimit: '1mb',
  },
};
```

注意：获取请求的 body，是用 ctx.request.body

### 5、获取上传的文件

框架内置`Multipart插件`，可支持获取用户上传的文件（`multipart/form-data请求`），实例如下：

```html
<form
  method="POST"
  action="/upload?_csrf={{ ctx.csrf | safe }}"
  enctype="multipart/form-data"
>
  <p>文件名称：<input name="title" /></p>
  <p>文件：<input name="file" type="file" /></p>
  <button type="submit">上传</button>
</form>
```

```js
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const { Controller } = require('egg');

class UploaderController extends Controller {
  async upload() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    const name = 'egg-multipart-test/' + path.basename(stream.filename);
    // 文件处理、传到云存储等
    let result;
    try {
      result = await ctx.oss.put(name, stream);
    } catch (err) {
      // 将上传的文件流消费掉，避免浏览器卡死
      await sendToWormhole(stream);
      throw err;
    }
    // 获取表单字段，则可通过`stream.fields`对象
  }
}

module.exports = UploaderController;
```

然而，通过`ctx.getFileStream()`获取文件有两个局限性：

- 只支持上传一个文件
- 上传文件必须在所有其他 fields 后面，否则在拿文件流时获取不到 fields
  若要上传多个文件，可以用以下的方式：

```js
const sendToWormhole = require('stream-warmhole');
const { Controller } = require('egg');

class UploaderController extends Controller {
  async upload() {
    const { ctx } = this;
    const parts = ctx.multipart(); // 返回的是Promise
    let part;
    while ((part = await parts()) !== null) {
      // 如果是数组，是filed
      if (part.length) {
        console.log(`field: ${part[0]}`);
        console.log(`value: ${part[1]}`);
        console.log(`valueTruncated: ${part[2]}`);
        console.log(`filedNameTruncated: ${part[3]}`);
      } else {
        // 若用户不选择文件就上传，那么part是file stream，但part.filename为空
        if (!part.filename) return;
        // 获取信息
        console.log(`field: ${part.fieldname}`);
        console.log(`filename: ${part.filename}`);
        console.log(`encoding: ${part.encoding}`);
        console.log(`mime: ${part.mime}`);
        // 文件处理、传到云存储等
        let result;
        try {
          result = await ctx.oss.put(name, stream);
        } catch (err) {
          // 将上传的文件流消费掉，避免浏览器卡死
          await sendToWormhole(stream);
          throw err;
        }
      }
    }
  }
}

module.exports = UploaderController;
```

框架默认支持了一系列文件扩展名，若需要新增扩展名，则可以通过在`config/config.default.js`中配置进行支持：  
1.新增支持的文件扩展名

```js
module.exports = {
  multipart: {
    fileExtensions: ['.apk'],
  },
};
```

2.覆盖整个白名单

```js
module.exports = {
  multipart: {
    whitelist: ['.png'], // 只支持`.png`文件上传
  },
};
```

### 6、获取 Header

除了从 URL 和 body 上获取参数，还有一些参数是从请求 header 上获取的，可以通过如下方式获取 header：

- `ctx.headers/ctx.header/ctx.request.headers/ctx.request.header`，这几个方法都是等价的，获取整个 header 对象
- `ctx.get(name)/ctx.request.get(name)`，获取特定头部字段，头部字段不存在时返回空字符串
- `ctx.get(name)和ctx.headers[name]`的区别在于，前者会自动处理大小写

此外，有一些 header 是 HTTP 协议规定了具体含义的，有些是反向代理设置的约定俗成的，故框架对这些 header 进行了一些特

- `ctx.host` 先读取 `config.hostHeaders`中配置的值，读取不到再获取 `header`中的`host`值
- `ctx.protocol` 判断当前连接是否为加密的，是则返回 https，而处于非加密连接时，则先读取通过`config.protocolHeaders`中配置的值，如果还读取不到，则读取`config.protocol`
- `ctx.ips`获取请求经过的所有中间设备的 IP 地址列表，若`config.proxy = true`时，会读取`config.ipHeaders`中配置的值，读取不到则为[]
- `ctx.ip` 获取请求发起方的 IP 地址，优先从 ctx.ips 中获取，为空时使用连接上发起方的 IP 地址

### 7、Cookie

- 读取 cookie：ctx.cookies.get(cookieName)
- 创建/修改 cookie：ctx.cookies.set(cookieName, value)
- 删除 cookie：ctx.cookies.set(cookieName, null)

### 8、Session

- 读取 session：通过 ctx.session
- 设置 session：通过对 ctx.session[sessionName]赋值
- 删除 session：设置 ctx.session[sessionName] = null
- 在框架中，对 session 进行配置，可以修改 config/config.default.js：

```js
module.exports = {
  key: 'EGG_SESS',
  maxAge: 86400000,
};
```

### 9、参数校验

框架提供了 Validate 插件用于参数校验：

```js
// config/plugin.js
exports.validate = {
  enable: true,
  package: 'egg-validate',
};
```

使用方法则为调用 ctx.validate(rule, [body])，如：

```js
class PostController extends Controller {
  async create() {
    this.ctx.validate({
      title: { type: 'string' },
      content: { type: 'string' },
    });
  }
}
```

校验异常时，会抛出异常，异常状态码为 422，若需自己处理异常，则可用 try catch 捕获：

```js
class PostController extends Controller {
  async create() {
    const { ctx } = this;
    try {
      ctx.validate(createRule);
    } catch (err) {
      ctx.logger.warn(err.errors);
      ctx.body = { success: false };
    }
  }
}
```

若需自定义校验规则，则可用 app.validator.addRule(type, check)的方式：

```js
// app.js
app.validator.addRule('json', (rule, value) => {
  try {
    JSON.parse(value);
  } catch (err) {
    return 'Must be JSON string';
  }
});
// 在controller中使用：
ctx.validate({ test: 'json' }, ctx.query);
```

校验参数采用的是 Parameter 模块，具体规则可查看该模块的文档

### 10、调用 Service

我们并不想在 Controller 中实现太多业务逻辑，所以提供了一个 Service 层进行业务逻辑的封装，这不仅能提高代码的复用性，同时可以让我们的业务逻辑更好测试。

在 Controller 中可以调用任何一个 Service 上的任何方法，通过 ctx.service 对象即可调用，此外：Service 是懒加载的，只有在访问到它时，框架才会实例化该对象

```js
class PostController extends Controller {
  async create() {
    const ctx = this.ctx;
    const author = ctx.session.userId;
    const req = Object.assign(ctx.request.body, { author });
    // 调用 service 进行业务处理
    const res = await ctx.service.post.create(req);
    ctx.body = { id: res.id };
    ctx.status = 201;
  }
}
```

### 11、发送 HTTP 响应

- 使用 ctx.status 设置响应状态码
- 使用 ctx.body 设置响应主体
- 可调用 ctx.render()渲染模板，如：await ctx.render('home.tpl', { name: 'egg' })
- 可使用 ctx.set(key, value)来设置一个响应头，或者用 ctx.set(headers)设置多个 header
- 若要支持 JSONP，则可以在 router 里通过 app.jsonp()引入 JSONP 中间件，如下：

```js
// app/router.js
module.exports = (app) => {
  const jsonp = app.jsonp();
  app.router.get('/api/posts/:id', jsonp, app.controller.posts.show);
};
```

如此，当用户请求对应的 URL 的 query 中带有\_callback=fn 参数时，就会返回 JSONP 格式的数据，否则返回 JSON 格式的数据
框架默认情况下通过 query 里的\_callback 参数识别是否返回 JSONP 格式的数据，且这个值最多只能为 50 个字符，若需要修改这些默认配置，可以修改`config/config.default.js`：

```js
exports.jsonp = {
  callback: 'callback',
  limit: 100,
};
```

或者，也可以在 router 中，将配置传入 app.jsonp()作为参数，实现更灵活的配置

## 7、服务（Service）

从 Controller 用户输入的数据，传到 Service 层， 在 Service 层进行业务逻辑的处理。

- 1.保持 Controller 中的逻辑更加简洁。
- 2.保持业务逻辑独立性，抽象出来的 Service 可以被多个 Controller 重复调用

现在通过一组代码，详细展现 router、controller、service 直接三者的关系：

```js
// app/router.js
module.exports = (app) => {
  app.router.get('/user/:id', app.controller.user.info);
};

// app/controller/user.js
const Controller = require('egg').Controller;
class UserController extends Controller {
  async info() {
    const userId = ctx.params.id;
    const userInfo = await ctx.service.user.find(userId);
    ctx.body = userInfo;
  }
}
module.exports = UserController;

// app/service/user.js
const Service = require('egg').Service;
class UserService extends Service {
  // 默认不需要提供构造函数。
  // constructor(ctx) {
  //   super(ctx); 如果需要在构造函数做一些处理，一定要有这句话，才能保证后面 `this.ctx`的使用。
  //   // 就可以直接通过 this.ctx 获取 ctx 了
  //   // 还可以直接通过 this.app 获取 app 了
  // }
  async find(uid) {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const user = await this.ctx.db.query(
      'select * from user where uid = ?',
      uid,
    );

    // 假定这里还有一些复杂的计算，然后返回需要的信息。
    const picture = await this.getPicture(uid);

    return {
      name: user.user_name,
      age: user.age,
      picture,
    };
  }
}
module.exports = UserService;
```

## 8、中间件

egg 和 koa 的中间价一样，都是基于洋葱圈模型
![洋葱模型](https://img-blog.csdn.net/20180714140316832?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI2NzMzOTE1/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

接着我们编写两个测试中间件 middlewareOne 和 middlewareTwo：

```js
// middleware/middlewareOne.js
module.exports = (options, app) => {
  return async function middlewareOne(ctx, next) {
    console.log('==request one==');
    await next();
    console.log('==response one==');
  };
};

// middleware/middlewareTwo.js
module.exports = (options, app) => {
  return async function middlewareTwo(ctx, next) {
    console.log('==request two==');
    await next();
    console.log('==response two==');
  };
};
```

- options：中间件的参数，可在 Config 中配置；
- app 和 ctx 上面也说过了，有这两个对象在中间件中可以搞好多事，比如可以拿到 ctx.request 对参数进行修改等；
  next 为一个函数，下面会说作用。

写完中间件之后是需要在刚才说的`config.default.js`中进行配置的

```js
// config/config.default.js
exports.middleware = ['middlewareOne', 'middlewareTwo']; // 数组的顺序为中间件执行的顺序
exports.middlewareOne = {
  // 中间件参数（即options）
  msg: 'extra message',
};
```

洋葱圈模型就是说请求和响应都会走一遍中间件，通过 next()方法分割，请求时执行到 next()方法就跳到下一个中间价，看了这个执行顺序图应该对洋葱圈模型有了清晰的理解，如图：
![](https://img-blog.csdn.net/20180714143806785?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI2NzMzOTE1/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## 9、扩展（Extend）

框架的很多对象都是支持扩展的，我们可以在很多对象上扩展自定义的属性和方法，可扩展的对象有：Application、Context、helper、Request 和 Response。
编写扩展的方法就是创建对应的文件，之后会与原对象进行合并对象的 prototype 上，以此实现了扩展的功能，在 extend 文件夹下创建扩展文件：

[官方文档扩展](https://eggjs.org/zh-cn/basics/extend.html)

[参考-Egg 学习笔记](https://www.ruphi.cn/archives/295/#anchor5)  
[Egg 框架知识点 1.目录结构和具体内容](https://blog.csdn.net/baidu_33438652/article/details/81517145)  
[Egg.js 小记](https://blog.csdn.net/qq_26733915/article/details/81041739)  
[ejs+Egg.js+MongoDB 搭建极简版个人博客（增删改查）](http://yunkus.com/ejs-eggjs-mongodb-build-minimalist-blog/)

[Egg.js 体验](http://xgfe.github.io/2018/05/26/guanxiaofeng/Eggjs/)
