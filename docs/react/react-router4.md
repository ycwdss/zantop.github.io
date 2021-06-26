# react-router4

# 简介

RR4 本次采用单代码仓库模型架构（monorepo），这意味者这个仓库里面有若干相互独立的包，分别是：

- react-router React Router 核心
- react-router-dom 用于 DOM 绑定的 React Router
- react-router-native 用于 React Native 的 React Router
- react-router-redux React Router 和 Redux 的集成
- react-router-config 静态路由配置的小助手

`react-router` 还是 `react-router-dom`？

在 React 的使用中，我们一般要引入两个包，`react` 和 `react-dom`，那么 `react-router` 和 react-router-dom 是不是两个都要引用呢？

非也，坑就在这里。他们两个只要引用一个就行了，不同之处就是后者比前者多出了 `<Link> <BrowserRouter>`
这样的 DOM 类组件
。
因此我们只需引用 `react-router-dom` 这个包就行了。当然，如果搭配 `redux` ，你还需要使用 `react-router-redux`。
[what is the diff between react-router-dom & react-router?](https://github.com/ReactTraining/react-router/issues/4648)

# API 详解

## 1、BrowserRouter

使用 HTML5 历史 API（ pushState，replaceState 和 popstate 事件），让页面的 UI 同步与 URL  
[HTML5 history API](https://www.cnblogs.com/jehorn/p/8119062.html)  
有 5 个属性：

- basename: string
- getUserConfirmation: func
- forceRefresh: bool
- keyLength: number
- children: node

**1、basename: string**

作用：为所有位置添加一个基准 URL

使用场景：假如你需要把页面部署到服务器的二级目录，你可以使用 basename 设置到此目录。

```js
<BrowserRouter basename="/index">
   <Link to="/category">分类</Link>
</BrowserRouter>
//会渲染成
<a href="/index/category">
```

**2、getUserConfirmation: func**

作用：导航到此页面前执行的函数，默认使用 window.confirm

使用场景：当需要用户进入页面前执行什么操作时可用，不过一般用到的不多。

```js
const getConfirmation = (message, callback) => {
  window.confirm(message);
  callback();
};

<BrowserRouter
  getUserConfirmation={getConfirmation('Are you sure?', function () {
    console.log('回调');
  })}
></BrowserRouter>;
//进入页面前会弹出确认框，确定后执行``console.log('回调')``
```

**3、forceRefresh: bool**

作用：当设置为 true 时，在导航的过程中整个页面将会刷新。 只有当浏览器不支持 HTML5 的 history API 时，才设置为 true。

使用场景：同上。

```
const supportsHistory = 'pushState' in window.history
<BrowserRouter forceRefresh={!supportsHistory} />
```

**4、keyLength: number**

作用：设置它里面路由的 location.key 的长度。默认是 6。（key 的作用：点击同一个链接时，每次该路由下的 location.key 都会改变，可以通过 key 的变化来刷新页面。）

使用场景：按需设置。

```js
<BrowserRouter keyLength={12} />
```

**5、children: node**

作用：渲染唯一子元素。

使用场景：作为一个 Reac t 组件，天生自带 children 属性。

```js
<BrowserRouter keyLength={12}>
  <div className="App">
    <nav>
      <ul>
        <li>
          <NavLink exact={true} activeClassName="selected" to="/home">
            首页
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="selected" to="/category">
            分类
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="selected" to="/products">
            商品
          </NavLink>
        </li>
      </ul>
    </nav>
    <Switch>
      <Route path="/home" component={Home} />
      <Route path="/category" component={Category} />
      <Route strict={true} path="/products/name" component={Products} />
    </Switch>
  </div>
</BrowserRouter>
```

## 2、HashRouter

它使用 URL 的哈希部分（即 window.location.hash）来保持页面的 UI 与 URL 同步,不支持 location.key 、location.state

[URL 的井号](http://www.ruanyifeng.com/blog/2011/03/url_hash.html)

用法与`BrowserRouter`基本一致。

BrowserRouter 与 HashRouter 区别：

**2.1、** url 上表现不一致：

```js
//BrowserRouter
http://localhost:8887/about
```

```js
//HashRouter
http://localhost:8887/#/about
```

`BrowserRouter`刷新浏览器会 404

browserHistory 模式下，URL 是指向真实 URL 的资源路径，当通过真实 URL 访问网站的时候（首页），这个时候可以正常加载我们的网站资源，而用户在非首页下手动刷新网页时，由于路径是指向服务器的真实路径，但该路径下并没有相关资源，用户访问的资源不存在，返回给用户的是 404 错误

方案一：修改 packge.json

```js
--history - api - fallback;
```

方案二 historyApiFallback

```js
//webpack配置
devServer:{
        historyApiFallback: true
    },
```

方案三 ngnix 配置

```js
server {
  ...
  location / {
    try_files $uri /index.html
  }
}
```

**2.2、** 传递参数

1、路由中 id 传参

```js
<Route path=" /about/:id " component={About} />
```

```js
//HTML方式
<Link to={' /about/2'}>关于</Link>;
//js方式
this.props.history.push('/about/2');
```

通过 this.props.match.params.id 就可以接受到传递过来的参数 id

2、query 和 state 传参

`2.1 query方式`

可传对象，地址栏中显示参数

```js
<Route path=" /about" component={About} />
```

```js
//HTML方式
<Link to={{ path : ' /about ' , query : { name : 'sunny' }}}>

//JS方式
this.props.history.push({ pathname: '/about' ,query : { name: ' sunny'} })
```

获取参数：`this.props.history.location.query.name`

`2.2 state方式`

可传对象，地址栏中不显示参数

与`query`类似，不同就是`state`是加密的，不会再浏览器地址栏中显示，

在`BrowserRouter`模式下，`state`刷新前进后退,值一直存在，`query`会丢失。

```js
location: {
  hash: '';
  key: 'kgc47k';
  pathname: '/about';
  search: '';
  state: {
    name: ' sunny';
  }
}
```

在`HashRouter`模式下，`state`、`query`都会丢失,缺失`location`的 key

```js
location: {
  hash: '';
  pathname: '/about';
  search: '';
  state: {
    name: ' sunny';
  }
}
```

这就是`HashRouter`不支持 location.key 、location.state 了

## 3、Link

为您的应用提供声明式的、无障碍导航。

有 3 个属性：

- to: string
- to: object
- replace: bool

**1、to: string**

作用：跳转到指定路径

使用场景：如果只是单纯的跳转就直接用字符串形式的路径。

```js
<Link to="/about">关于</Link>
```

**2、to: object**

作用：携带参数跳转到指定路径

作用场景：比如你点击的这个链接将要跳转的页面需要展示此链接对应的内容，又比如这是个支付跳转，需要把商品的价格等信息传递过去。

```js
<Link
  to={{
    pathname: '/course',
    search: '?sort=name',
    state: { price: 18 },
  }}
/>
```

**3、replace: bool**

为 true 时，点击链接后将使用新地址替换掉上一次访问的地址，什么意思呢?

比如：你依次访问 '/one' '/two' '/three' ’/four' 这四个地址，如果回退，将依次回退至 '/three' '/two' '/one' ，这符合我们的预期，假如我们把链接 '/three' 中的 replace 设为 true 时。依次点击 one two three four 然后再回退会发生什么呢？会依次退至 '/three' '/one'！ 为此我做了个在线 demo，大家可以调试体会一下 !

[replace 示例](https://codepen.io/minooo/pen/dvwxxZ?editors=0010)

## 4、NavLink

这是 `<Link>` 的特殊版，顾名思义这就是为页面导航准备的。因为导航需要有 “激活状态”。

- activeClassName: string
- activeStyle: object
- exact: bool
- strict: bool
- isActive: func

**1、activeClassName: string**

导航选中激活时候应用的样式名，默认样式名为 active

```js
<NavLink to="/about" activeClassName="selected">
  关于
</NavLink>
//选中的时候，样式名为selected
```

**2、activeStyle: object**

如果不想使用样式名就直接写 style

```js
<NavLink to="/about" activeStyle={{ color: 'green', fontWeight: 'bold' }}>
  关于
</NavLink>
```

**3、exact: bool**

若为 true，只有当访问地址严格匹配时激活样式才会应用，选中的时候才会匹配。

```js
<li>
  <NavLink exact={true} activeClassName="selected" to="/">
    首页
  </NavLink>
</li>
```

**4、strict: bool**

若为 true，只有当访问地址==后缀斜杠严格匹配（有或无）==时激活样式才会应用

**5、isActive: func**

决定导航是否激活，或者在导航激活时候做点别的事情。不管怎样，它不能决定对应页面是否可以渲染。

```js
const isActive = (match, location) => {
  console.log(match, location);
};
<NavLink to="/about" isActive={isActive}>
  关于
</NavLink>;
```

## 5、`Prompt`

当用户离开当前页面前做出一些提示。

有 3 个属性：

- message: string
- message: func
- when: bool

**1、message: string**

当用户离开当前页面时，设置的提示信息。

```js
const Products = () => (
  <div>
    <h2>商品</h2>
    <Prompt message="数据尚未保存，确定离开？" />
  </div>
);
```

**2、message: func**

当用户离开当前页面时，设置的回掉函数

```js
const Products = () => (
  <div>
    <h2>商品</h2>
    <Prompt
      message={(location) => `即将去下一个路由，地址为${location.pathname}?`}
    />
  </div>
);
//会弹出个提示，下一个路由的地址
```

**3、when: bool**

通过设置一定条件要决定是否启用 Prompt,`when={false}`不启用，`when={true}`启用

```js
const Products = () => (
  <div>
    <h2>商品</h2>
    <Prompt
      when={false}
      message={(location) => `即将去下一个路由，地址为${location.pathname}?`}
    />
  </div>
);
```

## 6、Redirect

`<Redirect>` 渲染时将导航到一个新地址，这个新地址覆盖在访问历史信息里面的本该访问的那个地址。

有 4 个属性：

- to: string
- to: object
- push: bool
- from: string

**1、to: string**
重定向的 URL 字符串

**2、to: object**
重定向的 location 对象

**3、push: bool**
若为真，重定向操作将会把新地址加入到访问历史记录里面，并且无法回退到前面的页面。

**4、from: string**
需要匹配的将要被重定向路径。

## 7、Route

`<Route>`也许是 RR4 中最重要的组件了，重要到你必须理解它，学会它，用好它。它最基本的职责就是当页面的访问地址与 Route 上的 `path` 匹配时，就渲染出对应的 UI 界面。

`<Route>` 自带三个 render method 和三个 props 。

render methods 分别是：

```js
<Route component>
<Route render>
<Route children>
```

每种 render method 都有不同的应用场景，同一个`<Route>` 应该只使用一种 render method ，大部分情况下你将使用 `component` 。

props 分别是：

```js
match;
location;
history;
```

所有的 render method 无一例外都将被传入这些 props。

**1、component**

只有当访问地址和路由匹配时，一个`Reactcomponent`才会被渲染，此时此组件接受 `route props (match, location, history)`。
当使用`component` 时，`router`将使用 `React.createElement` 根据给定的 component 创建一个新的 React 元素。这意味着如果你使用内联函数（inline function）传值给 `component`将会产生不必要的重复装载。对于内联渲染（inline rendering）, 建议使用 renderprop。

```js
<Route path="/home" component={Home} />
```

**2、render: func**

此方法适用于内联渲染，而且不会产生上文说的重复装载问题。

```js
<Route
  path="/products"
  render={() => {
    return <h3>哈哈</h3>;
  }}
/>

//当没有匹配 component的时候，render会渲染，如果component存在又render，那么component会覆盖render的
```

**3、children: func**

有时候你可能只想知道访问地址是否被匹配，然后改变下别的东西，而不仅仅是对应的页面。

**4、path: string**

任何可以被 path-to-regexp 解析的有效 URL 路径

```js
<Route path="/products/:name" component={Products} />
```

如果不给 path，那么路由将总是匹配。

**5、exact: bool**

如果为 true，path 为 '/one' 的路由将不能匹配 '/one/two'，反之，亦然。

```js
 <li><NavLink activeClassName="selected" to="/products/22">商品</NavLink></li>
 //上面可以匹配到
 <Route  path="/products" component={Products} ></Route>
 //如果设置exact={true}，将匹配不到下面的路由
 <Route exact={true} path="/products" component={Products} ></Route>
```

**6、strict: bool**

对路径末尾斜杠的匹配。如果为 true。path 为 '/one/' 将不能匹配 '/one' 但可以匹配 '/one/two'。

```js
 <li><NavLink activeClassName="selected" to="/products">商品</NavLink></li>
 //匹配不到下面的路由
 <Route strict={true} path="/products/" component={Products} ></Route>
 //但可以匹配
  <Route strict={true} path="/products/info" component={Products} ></Route>
```

```js
path	location.pathname	matches?
/one/	/one	no
/one/	/one/	yes
/one/	/one/two	yes
```

如果要确保路由没有末尾斜杠，那么 strict 和
exact 都必须同时为 true

## 8、Router

Router 和 Route 两种看起来名字很接近的组件，但他们的作用不一样，Router 作为顶级的容器使用，而 Route 作为一个子路由组件。

react-router v4 中，Router 被拆分成了 `StaticRouter`、`MemoryRouter`、`BrowserRouter`、`HashRouter`、`NativeRouter`。

- `<BrowserRouter>`：使用 HTML5 提供的 history API 来保持 UI 和 URL 的同步；
- `<HashRouter>`：使用 URL 的 hash (例如：window.location.hash) 来保持 UI 和 URL 的同步；
- `<MemoryRouter>`：能在内存保存你 “URL” 的历史纪录(并没有对地址栏读写)；
- `<NativeRouter>`：为使用 React Native 提供路由支持；
- `<StaticRouter>`：从不会改变地址；

Router 有 2 个属性：

- history: object
- children: node

**1、history: object**

history 是用来兼容不同浏览器或者环境下的历史记录管理的，当我跳转或者点击浏览器的后退按钮时，history 就必须记录这些变化，而之前的 react-router 将 history 分为三类。

- hashHistory 老版本浏览器的 history
- browserHistory h5 的 history
- memoryHistory node 环境下的 history，存储在 memory 中

  4.0 之前版本的 react-router 针对三者分别实现了==createHashHistory==、==createBrowserHistory==和==create MemoryHistory==三个方法来创建三种情况下的 history，这里就不讨论他们不同的处理方式了，好奇的可以去了解一下~

到了 4.0 版本，在 react-router-dom 中直接==将这三种 history 作了内置==，于是我们看到了==BrowserRouter==、==HashRouter==、==MemoryRouter==,==NativeRouter==这 4 种 Router，当然，你依然可以使用 React-router 中的 Router，然后自己通过 createHistory 来创建 history 来传入。

```js
import createBrowserHistory from 'history/createBrowserHistory'

const customHistory = createBrowserHistory()
<Router history={customHistory}/>
```

通常，我们更倾向选择 `<BrowserRouter>`

**2、children: node**

作用：渲染唯一子元素。
使用场景：作为一个 Reac t 组件，天生自带 children 属性。

## 9、Switch

只渲染出第一个与当前访问地址匹配的 `<Route>` 或 `<Redirect>`。

考如下代码，如果你访问 /about，那么组件 Nomatch 都将被渲染出来，因为他们对应的路由与访问的地址 /about 匹配。这显然不是我们想要的，我们只想==渲染出第一个匹配的路由==就可以了，于是 `<Switch>`应运而生！

```js
<Route path="/"  component={Home}></Route>
<Route path="/category" component={Category}></Route>
<Route  component={Products}></Route> //这个组件是一直显示
```

也许你会问，为什么 RR4 机制里不默认匹配第一个符合要求的呢，答：这种设计允许我们将多个 `<Route>`组合到应用程序中，例如侧边栏（sidebars），面包屑 等等。

另外，`<Switch>` 对于转场动画也非常适用，因为被渲染的路由和前一个被渲染的路由处于同一个节点位置！

```js
<BrowserRouter keyLength={12}>
  <div className="App">
    <nav>
      <ul>
        <li>
          <NavLink exact={true} activeClassName="selected" to="/home">
            首页
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="selected" to="/category">
            分类
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="selected" to="/products">
            商品
          </NavLink>
        </li>
      </ul>
    </nav>
    <Switch>
      <Route path="/home" component={Home} />
      <Route path="/category" component={Category} />
      <Route component={Products} />
    </Switch>
  </div>
</BrowserRouter>
// /home只会匹配到对应的home组件
//<Route  component={Products}></Route>不会一直显示,只有当匹配不到时才会显示
```

**children: node**

`<Switch>` 下的子节点只能是 `<Route>` 或 `<Redirect>` 元素。只有与当前访问地址匹配的第一个子节点才会被渲染。

`<Route>` 元素用它们的 path 属性匹配，`<Redirect>` 元素使用它们的 from 属性匹配。如果没有对应的 path 或 from，那么它们将匹配任何当前访问地址。

## 10、`history`

histoty 是 RR4 的两大重要依赖之一（另一个当然是 React 了），在不同的 JavaScript 环境中， history 以多种能够行驶实现了对会话（session）历史的管理。

我们会经常使用以下术语：

- "browser history" - history 在 DOM 上的实现，用于支持 HTML5 history API 的浏览器
- "hash history" - history 在 DOM 上的实现，用于旧版浏览器。
- "memory history" - history 在内存上的实现，用于测试或非 DOM 环境（例如 React Native）

history 对象通常具有以下属性和方法：

- length: number 浏览历史堆栈中的条目数
- action: string 路由跳转到当前页面执行的动作，分为 PUSH, REPLACE, POP
- location: object 当前访问地址信息组成的对象，具有如下属性：
  - pathname: string URL 路径
  - search: string URL 中的查询字符串
  - hash: string URL 的 hash 片段
  - state: string 例如执行 push(path, state) 操作时，location 的 state 将被提供到堆栈信息里，state 只有在 browser 和 memory history 有效。
- push(path, [state]) 在历史堆栈信息里加入一个新条目。
- replace(path, [state]) 在历史堆栈信息里替换掉当前的条目
- go(n) 将 history 堆栈中的指针向前移动 n。
- goBack() 等同于 go(-1)
- goForward 等同于 go(1)
- block(prompt) 阻止跳转

==history 对象==是可变的，因为建议从`<Route>`的 prop 里来==获取 location==，而不是从 history.location 直接获取。这样可以保证 React 在生命周期中的钩子函数正常执行

## 11、`location`

location 是指你当前的位置，将要去的位置，或是之前所在的位置

```js
{
  key: 'sdfad1'
  pathname: '/about',
  search: '?name=minooo'
  hash: '#sdfas',
  state: {
    price: 123
  }
}
```

在以下情境中可以获取 location 对象

- 在 Route component 中，以 this.props.location 获取
- 在 Route render 中，以 ({location}) => () 方式获取
- 在 Route children 中，以 ({location}) => () 方式获取
- 在 withRouter 中，以 this.props.location 的方式获取

location 对象不会发生改变，因此可以在生命周期的回调函数中使用 location 对象来查看当前页面的访问地址是否发生改变。这种技巧在获取远程数据以及使用动画时非常有用

```js
componentWillReceiveProps(nextProps) {
  if (nextProps.location !== this.props.location) {
    // 已经跳转了！
  }
}
```

可以在不同情境中使用 location：

```js
<Link to={location}/>
<NaviveLink to={location} />
<Redirect to={location />
history.push(location)
history.replace(location)
```

## 12、`match`

match 对象包含了 `<Route path>` 如何与 URL 匹配的信息，具有以下属性：

- params: object 路径参数，通过解析 URL 中的动态部分获得键值对
- isExact: bool 为 true 时，整个 URL 都需要匹配
- path: string 用来匹配的路径模式，用于创建嵌套的 `<Route>`
- url: string URL 匹配的部分，用于嵌套的 `<Link>`

在以下情境中可以获取 match 对象：

```js
在 Route component 中，以 this.props.match获取
在 Route render 中，以 ({match}) => () 方式获取
在 Route children 中，以 ({match}) => () 方式获取
在 withRouter 中，以 this.props.match的方式获取
matchPath 的返回值
```

当一个 Route 没有 path 时，它会匹配一切路径。

## 13、`withRouter`

很重要的一个功能，将普通组件用 withRouter 包裹后，组件就会获得 location history match 三个属性，可以用来直接为子组件提供 历史相关的功能

```js
export default withRouter(App);

// App.js
const { history, location, match } = this.props;
```

[初探 React Router 4.0](http://blog.csdn.net/sinat_17775997/article/details/69218382)

[关于 React Router 4 的一切](http://blog.csdn.net/sinat_17775997/article/details/77411324)

[菜单公用嵌套路由](https://segmentfault.com/q/1010000011520561)

[React Router 4 - WEB API](https://www.edlad.com/2017/05/08/react-router-web-api/#Router)

[深入理解 react-router 路由系统](http://www.cnblogs.com/wyaocn/p/5805777.html)
[深入理解 react-router ](http://zhangdajia.com/)
