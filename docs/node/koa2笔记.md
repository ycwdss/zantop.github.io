# koa2 笔记

## 1、hello world

启动 http 服务器环境

```js
const Koa = require("koa");
const app = new Koa();
app.listen(3000);
```

此时打开浏览器输入地址`http://localhost:3000'`,可以看到`Not Found`,那么接下来让浏览器显示点东西。

入坑第一步`hello world`

```js
const Koa = require("koa");
const app = new Koa();

const main = ctx => {
  ctx.response.body = "Hello World";
};

app.use(main);
app.listen(3000);
```

浏览器中打开可以看到，页面上就显示了`hello world`,此时出现了`ctx`和`app.use`是什么？

app.use()用来加载中间件。

像`main`这样的函数叫做==中间件(middleware)==,因为它处在 HTTP Request 和 HTTP Response 中间，用来实现某种中间功能。

`ctx`是 Koa 所提供的 Context 对象(上下文)，这是响应体设置的 API。

下面就来看下什么是`ctx`。

## 2、Context 对象

我们可以打印`ctx`看是个什么东西。

```js
const Koa = require("koa");
const app = new Koa();

const main = ctx => {
  console.log(ctx);
};

app.use(main);
app.listen(3000);
```

下面就是打印出来的 ctx。

```js
{ request:
   { method: 'GET',
     url: '/',
     header:
      { host: 'localhost:3000',
        connection: 'keep-alive',
        'cache-control': 'max-age=0',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9',
        cookie: 'Webstorm-54fccd33=e78c69bc-7736-44fc-acc2-70d1eba51607; Hm_lvt_cee71ad5ce79ff119f8e4800061964fa=1503310293; UM_distinctid=15e79ca1ad53fb-0c7ab802120c5c-3f63440c-100200-15e79ca1ad655b; optimizelyEndUserId=oeu1505962785143r0.9732603965542266; _ga=GA1.1.1020886797.1503565407; CNZZDATA1263396231=1982896686-1505281841-%7C1511860274; userInfo={"_id":"5a3c75186cae2c5693f59fd9","username":"admin"}; connect.sid=s%3AFo08fkhxt5LcCuKMuRT9RuQrozwz4EKP.a0iVUg7B17FIq5NYBns3%2FOPe5lhnnXcDU6ip9YGOlts; _gid=GA1.1.1037932880.1514535016' } },
  response: { status: 404, message: 'Not Found', header: {} },
  app: { subdomainOffset: 2, proxy: false, env: 'development' },
  originalUrl: '/',
  req: '<original node req>',
  res: '<original node res>',
  socket: '<original node socket>' }
```

可以看到返回了

- Request：koa 的 Request 对象
- Response：koa 的 Response 对象
- app：应用程序实例引用
- req：Node 的 request 对象
- res：Node 的 response 对象
- originalUrl：获取请求原始 URL
- socket：Node 的长连接信息

在处理 http 请求时，Node 提供了 request 和 response 两个对象，Koa 把两者封装到了同一个对象中，即`context`，缩写为 ctx

在 context 中封装了许多方法，大部分都是从原生的 request/response 对象使用委托方式得来的，如下表：

```js
from request

• ctx.header   //与ctx.request.header等效 请求标头对象
• ctx.headers
• ctx.method
• ctx.method=
• ctx.url
• ctx.url=
• ctx.originalUrl
• ctx.origin
• ctx.href
• ctx.path
• ctx.path=
• ctx.query
• ctx.query=
• ctx.querystring
• ctx.querystring=
• ctx.host
• ctx.hostname
• ctx.fresh
• ctx.stale
• ctx.socket
• ctx.protocol
• ctx.secure
• ctx.ip
• ctx.ips
• ctx.subdomains
• ctx.is()
• ctx.accepts()
• ctx.acceptsEncodings()
• ctx.acceptsCharsets()
• ctx.acceptsLanguages()
• ctx.get()

From response
• ctx.body    //与ctx.response.body等效
• ctx.body=
• ctx.status
• ctx.status=
• ctx.message
• ctx.message=
• ctx.length=
• ctx.length
• ctx.type=
• ctx.type
• ctx.headerSent
• ctx.redirect()
• ctx.attachment()
• ctx.set()
• ctx.append()
• ctx.remove()
• ctx.lastModified=
• ctx.etag=
```

例：可以使用 ctx.request.header=设置头信息等。

[详情 koa 官网 context](http://koajs.com/#context)

[详情 koa 中文 context](https://koa.bootcss.com/#context)

## 3、中间件

**1、中间件的概念**

上面提到了`main`函数就是一个中间件，使用 app.use 来加载中间件。

我们可以把`main`函数另放到`main.js`文件，并在`app.js`引入使用

```js
//main.js

const main = ctx => {
  ctx.response.body = "Hello World";
  console.log(ctx);
};
module.exports = main;
```

```js
//app.js

const Koa = require("koa");
const app = new Koa();
const main = require("./main");

app.use(main);
app.listen(3000);
```

刷新浏览器，会看到 console.log()出来内容，这样我们可以把功能模块放到单独的 js 文件作为中间件。

每个中间件默认接受`两个参数`，第一个参数是 `Context对象`，第二个参数是`next函数`。只要调用 next 函数，就可以把执行权转交给下一个中间件。

```js
//a.js

const a = (ctx, next) => {
  console.log("我是小a");
  next();
};
module.exports = a;
```

```js
//b.js
const b = (ctx, next) => {
  console.log("我是小b");
  next();
};
module.exports = b;
```

```js
const Koa = require("koa");
const app = new Koa();
const a = require("./a");
const b = require("./b");

app.use(a); //我是小a
app.use(b); //我是小b
app.listen(3000);
```

如果 a.js 中没有`next()`函数，那么只会打印出`我是小a`,中间件`b.js`不会被载入执行。

**2、中间件栈**
多个中间件会形成一个栈结构（middle stack），以"先进后出"（first-in-last-out）的顺序执行。

- 最外层的中间件首先执行。
- 调用 next 函数，把执行权交给下一个中间件。
- ...
- 最内层的中间件最后执行。
- 执行结束后，把执行权交回上一层的中间件。
- ...
- 最外层的中间件收回执行权之后，执行 next 函数后面的代码。

下图为经典的 Koa 洋葱模型：

![Koa洋葱模型](https://mmbiz.qpic.cn/mmbiz_png/jQxqlKeecNuAkxNic43wOrV6gEOegbhmR2Yboicpg2DEkhLgIOSRSQvIbkSIlKQBaVBgz6RAUIvGLByZhZasePiaw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

可以看下面的例子：

```js
const Koa = require("koa");
const app = new Koa();
const one = (ctx, next) => {
  console.log(">> one");
  next();
  console.log("<< one");
};

const two = (ctx, next) => {
  console.log(">> two");
  next();
  console.log("<< two");
};

const three = (ctx, next) => {
  console.log(">> three");
  next();
  console.log("<< three");
};

app.use(one);
app.use(two);
app.use(three);

app.listen(3000);
```

打印出的结果：

```js
>> one
>> two
>> three
<< three
<< two
<< one
```

如果`two`函数中没有 next()函数，输出结果是什么呢？

three 中间件不会执行。

```js
>> one
>> two
<< two
<< one
```

**3、异步中间件**

迄今为止，所有例子的中间件都是同步的，不包含异步操作。如果有异步操作（比如读取数据库），中间件就必须写成 ==async 函数==。

```js
const fs = require("fs.promised");
const Koa = require("koa");
const app = new Koa();

const main = async function(ctx, next) {
  ctx.response.type = "html";
  ctx.response.body = await fs.readFile("./demos/template.html", "utf8");
};

app.use(main);
app.listen(3000);
```

面代码中，fs.readFile 是一个异步操作，必须写成 await fs.readFile()，然后中间件必须写成 async 函数。

**4、中间件的合成**

==koa-compose==模块可以将多个中间件合成为一个。请看下面的例子

```js
const Koa = require("koa");
const app = new Koa();
const compose = require("koa-compose");

const main = function(ctx, next) {
  console.log("main");
  next();
};
const sub = (ctx, next) => {
  ctx.response.body = "儿子";
};
const middleWares = compose([main, sub]);
app.use(middleWares);
app.listen(3000);
```

# 3、路由

路由是用于描述 URL 与处理函数之间的对应关系的。比如用户访问http://localhost:3000/，那么浏览器就会显示 index 页面的内容，如果用户访问的是 http://localhost:3000/home，那么浏览器应该显示 home 页面的内容。

**1、原生路由**

├── app.js
├── package.json
└── view
├── 404.html
├── index.html
└── todo.html

```js
const Koa = require("koa");
const fs = require("fs");
const app = new Koa();

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
function render(page) {
  return new Promise((resolve, reject) => {
    let viewUrl = `./view/${page}`;
    fs.readFile(viewUrl, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * 根据URL获取HTML内容
 * @param  {string} url koa2上下文的url，ctx.url
 * @return {string}     获取HTML文件内容
 */
async function route(url) {
  let view = "404.html";
  switch (url) {
    case "/":
      view = "index.html";
      break;
    case "/index":
      view = "index.html";
      break;
    case "/todo":
      view = "todo.html";
      break;
    case "/404":
      view = "404.html";
      break;
    default:
      break;
  }
  let html = await render(view);
  return html;
}

app.use(async ctx => {
  let url = ctx.request.url;
  let html = await route(url);
  ctx.body = html;
});

app.listen(3000);
```

如果依靠 ctx.request.url 去手动处理路由，将会写很多处理代码，这时候就需要对应的路由的中间件对路由进行控制，这里介绍一个比较好用的路由中间件 koa-router

**2、koa-router**

引入 koa-router 包，上面的例子可以改写成：

```js
const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
function render(page) {
  return new Promise((resolve, reject) => {
    let viewUrl = `./view/${page}`;
    fs.readFile(viewUrl, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

router.get("/", async (ctx, next) => {
  ctx.body = await render("index.html");
});
router.get("/index", async (ctx, next) => {
  ctx.body = await render("index.html");
});
router.get("/todo", async (ctx, next) => {
  ctx.body = await render("todo.html");
});
router.get("/404", async (ctx, next) => {
  ctx.body = await render("404.html");
});
//调用路由中间件

app.use(router.routes());
app.listen(3000);
```

当然，除了 GET 方法，koa-router

也支持处理其他的请求方法，比如：

```js
router
  .get("/", async (ctx, next) => {
    ctx.body = "Hello World!";
  })
  .post("/users", async (ctx, next) => {
    // ...
  })
  .put("/users/:id", async (ctx, next) => {
    // ...
  })
  .del("/users/:id", async (ctx, next) => {
    // ...
  })
  .all("/users/:id", async (ctx, next) => {
    // ...
  });
```

在 HTTP 协议方法中，GET、POST、PUT、DELETE 分别对应 查，增，改，删，这里 router 的方法也一一对应。通常我们使用 GET 来查询和获取数据，使用 POST 来更新资源。PUT 和 DELETE 使用比较少，但是如果你们团队采用 RESTful 架构，就比较推荐使用了。我们注意到，上述代码中还有一个 all 方法。all 方法用于处理上述方法无法匹配的情况，或者你不确定客户端发送的请求方法类型。

**命令路由**

```js
const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = new Router();
const fs = require("fs");

router.get("/user", "/user/:id", async (ctx, next) => {
  ctx.body = "用户中心";
  console.log(ctx.url); //   /user/3
});

//调用路由中间件
app.use(router.routes());
app.listen(3000);
```

**路由前缀**

通过 prefix 这个参数，我们可以为一组路由添加统一的前缀，和嵌套路由类似，也方便我们管理路由和简化路由的写法。不同的是，前缀是一个固定的字符串，不能添加动态参数。

```js
var router = new Router({
  prefix: '/users'
});

router.get('/', ...); // 匹配路由 "/users"
router.get('/:id', ...); // 匹配路由 "/users/:id"
```

**嵌套路由**
我们可以在应用中定义多个路由，然后把这些路由组合起来用，这样便于我们管理多个路由，也简化了路由的写法。

```js
var forums = new Router();
var posts = new Router();

posts.get('/', function (ctx, next) {...});
posts.get('/:pid', function (ctx, next) {...});
forums.use('/forums/:fid/posts', posts.routes(), posts.allowedMethods());

// 可以匹配到的路由为 "/forums/123/posts" 或者 "/forums/123/posts/123"
app.use(forums.routes());
```

**多中间件**
koa-router 也支持单个路由多中间件的处理。通过这个特性，我们能够为一个路由添加特殊的中间件处理。也可以把一个路由要做的事情拆分成多个步骤去实现，当路由处理函数中有异步操作时，这种写法的可读性和可维护性更高。比如下面的示例代码所示：

```js
router.get(
  "/users/:id",
  function(ctx, next) {
    return User.findOne(ctx.params.id).then(function(user) {
      // 首先读取用户的信息，异步操作
      ctx.user = user;
      next();
    });
  },
  function(ctx) {
    console.log(ctx.user);
    // 在这个中间件中再对用户信息做一些处理
    // => { id: 17, name: "Alex" }
  }
);
```

**重定向**

```js
const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");

const fs = require("fs");

const router = new Router({
  prefix: "/user"
});
router.get("/sign", (ctx, next) => {
  ctx.body = "登录";
});
router.get("/:id", (ctx, next) => {
  ctx.body = "用户中心";
  ctx.redirect("/user/sign");
});

//调用路由中间件
app.use(router.routes());
app.listen(3000);
```

# 4、koa-static 静态资源

如果网站提供静态资源（图片、字体、样式表、脚本......），为它们一个个写路由就很麻烦，也没必要。koa-static 模块封装了这部分的请求。

给之前的`index.html`页面添加样式。
新建 static 文件夹，新建样式 app.css,view 目录下 index.html 页面添加样式。

`<link rel="stylesheet" href="/app.css">`这样页面就引入了样式。

```js
const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = new Router();
const statics = require("koa-static");
const fs = require("fs");
const path = require("path");

app.use(statics(path.join(__dirname, "./static")));
/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
function render(page) {
  return new Promise((resolve, reject) => {
    let viewUrl = `./view/${page}`;
    fs.readFile(viewUrl, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

router.get("/", async (ctx, next) => {
  ctx.body = await render("index.html");
});
router.get("/index", async (ctx, next) => {
  ctx.body = await render("index.html");
});
router.get("/todo", async (ctx, next) => {
  ctx.body = await render("todo.html");
});
router.get("/404", async (ctx, next) => {
  ctx.body = await render("404.html");
});
//调用路由中间件

app.use(router.routes());
app.listen(3000);
```

# 5、get 和 post 请求

了解下 Koa 获取请求数据，主要为 GET 和 POST 方式.

**1、GET 请求参数的获取**

koa-router 封装的 request 对象，里面的 query 方法或 querystring 方法可以直接获取到 Get 请求的数据，唯一不同的是 query 返回的是对象，而 querystring 返回的是字符串。

```js
const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = new Router();
const statics = require("koa-static");
const fs = require("fs");
const path = require("path");

app.use(statics(path.join(__dirname, "./static")));
/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
function render(page) {
  return new Promise((resolve, reject) => {
    let viewUrl = `./view/${page}`;
    fs.readFile(viewUrl, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

router.get("/index", async (ctx, next) => {
  console.log(ctx.request.query);
  console.log(ctx.request.querystring);
  ctx.body = await render("index.html");
});
router.get("/todo", async (ctx, next) => {
  ctx.body = await render("todo.html");
});
router.get("/404", async (ctx, next) => {
  ctx.body = await render("404.html");
});
//调用路由中间件

app.use(router.routes());
app.listen(3000);
```

在地址栏中输入：`http://localhost:3000/index?user=wang&id=26`

```js
//console.log的结果
{ user: 'wang', id: '26' }
user=wang&id=26
```

**请求参数放在 URL 中间**

```js
http://localhost:3000/index/wang/26
```

这种情况下，解析方式肯定与上面的不一样了，koa-router 会把请求参数解析在 params 对象上，我们修改 app.js 文件：

```js
router.get("/index/:user/:id", async (ctx, next) => {
  console.log(ctx.params);
  console.log(ctx.query);
  console.log(ctx.querystring);
  ctx.body = await render("index.html");
});
```

运行代码，并通过浏览器访问 http://localhost:3000/index/wang/26，然后查看下控制台显示的日志信息：

```js
{ user: 'wang', id: '26' }
```

**2、POST 请求数据获取**

对于 POST 请求的处理，koa2 没有封装获取参数的方法，需要通过自己解析上下文 context 中的原生 node.js 请求对象 req，将 POST 表单数据解析成 querystring（例如： `a=1&b=2&c=3`），再将 querystring 解析成 JSON 格式（例如： `{"a":"1","b":"2","c":"3"}`），我们来直接使用 koa-bodyparser 模块从 POST 请求的数据体里面提取键值对。

下面模拟个表单提交的 POST 实例：

```js
const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = new Router();
const bodyParser = require("koa-bodyparser");

//注册中间件
app.use(bodyParser());
//登录
router.get("/submit", (ctx, next) => {
  ctx.body = `<form action="/login" method="post">
    <input name="name" type="text" placeholder="请输入用户名：test"/>
    <br/>
    <input name="password" type="text" placeholder="请输入密码：123456"/>
    <br/>
    <button>登录</button>
 </form>`;
});
//响应表单提交
router.post("/login", (ctx, next) => {
  let { name, password } = ctx.request.body;
  if (name === "test" && password === "123456") {
    ctx.response.body = `Hello， ${name}！`;
  } else {
    ctx.response.body = "账号信息错误";
  }
});
app.use(router.routes());
app.listen(3000);
```

# 6、cookie 与 session

koa 提供了从上下文直接读取、写入 cookie 的方法

- ctx.cookies.get(name, [options]) 读取上下文请求中的 cookie
- ctx.cookies.set(name, value, [options]) 在上下文中写入 cookie

```js
const Koa = require("koa");
const app = new Koa();

app.use(async ctx => {
  if (ctx.url === "/index") {
    ctx.cookies.set("cid", "hello world", {
      domain: "localhost", // 写cookie所在的域名
      path: "/index", // 写cookie所在的路径
      maxAge: 10 * 60 * 1000, // cookie有效时长
      expires: new Date("2017-02-15"), // cookie失效时间
      httpOnly: false, // 是否只用于http请求中获取
      overwrite: false // 是否允许重写
    });
    ctx.body = "cookie is ok";
  } else {
    ctx.body = "hello world";
  }
});

app.listen(3000, () => {
  console.log("[demo] cookie is starting at port 3000");
});
```


[koa2学习笔记](https://juejin.im/post/5cd11420f265da036d79d0f3)