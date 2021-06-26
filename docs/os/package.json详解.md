# package.json详解

## package.json


```js
//.json 文件是不允许写注释的,方便阅读打的注释
{
  // 包的名称
  "name": "sg-utils",
  // 包的版本号
  "version": "1.4.6", 
  // 包的描述
  "description": "javascript通用工具类", 
  // 包的入口文件
  "main": "index.js", 
  // 上传npm的白名单，即被允许上传的文件
  "files": [ 
    "src",
    "demo",
    "index.js"
  ],
  // 指定了运行脚本命令的npm命令行缩写
  "scripts": {
    "start": "node server.js"
  },
  // 远程代码仓库
  "repository": {
    "type": "git",
    "url": "https://github.com/shiguang0116/sg-utils"
  },
  // 关键字
  "keywords": [
    "javascript",
    "util"
  ],
  // 作者
  "author": "guang.shi",
  // 许可证数组
  "license": "ISC",
  // 提交bug的地址
  "bugs": {
    "url": "https://github.com/shiguang0116/sg-utils/issues"
  },
  // 包的主页
  "homepage": "https://github.com/shiguang0116/sg-utils#readme",
  // 运行引擎，指明node.js运行所需要的版本
  "engines": {
    "node": ">= 6.0.0",
    "npm": ">= 3.0.0"
  },
  // 开发环境的依赖包列表
  "devDependencies": {
    "eslint": "^5.16.0",
    "eslint-config-vui": "^0.2.7",
    "eslint-plugin-html": "^5.0.5"
  },
  // 生产环境的依赖包列表
  "dependencies": {},
  // 依赖包列表
  "peerDependencies": {}
}
```

## dependencies

devDependencies、dependencies、peerDependencies的区别

1. devDependencies和dependencies  
`devDependencies`是只会在开发环境下依赖的模块，`生产环境不会被打入包内`。安装时，加上`--save-dev`
`dependencies`依赖的包不仅开发环境能使用，生产环境也能使用。安装时，加上`--save`

1. peerDependencies的作用
peerDependencies是用来发布npm插件时指定所需要兼容的宿主包的版本。比如以下场景：

- 我们开发`webpack-plugin-a@1.0.0`的时候是针对`webpack@2.0.0`来开发的；
- webpack发布了最新的`webpack@3.0.0`并且做了不兼容升级，导致`webpack-plugin-a@1.0.0`已经不能在该版本使用；
- 有不明真相的开发者，安装了`webpack@3.0.0`和我们的`webpack-plugin-a@1.0.0`；
- 由于webpack版本不兼容，当该开发者执行编译的时候肯定是要报错的。那么如何避免这种问题的发生呢？这就需要在w`ebpack-plugin-a@1.0`.0的package.json中添加如下配置：
```js
"peerDependencies": {s
    "webpack": "^2.0.0"
}
```
这样就指定了`webpack-plugin-a@1.0.0`只兼容`webpack@2.x.x`，当用户同时安装`webpack@3.0.0`和`webpack-plugin-a@1.0.0`的时候就会抛出：
```js
UNMET PEER DEPENDENCY webpack@3.0.0
npm WARN webpack-plugin-a@1.0.0 requires a peer of webpack@^2.0.0 but none was installed
```
以上提示，足够让开发者认识到当前所存在的风险了，该特性添加于Node.js 0.8.19(npm 1.2.10)版本。

## 版本符号说明

- ^ 是npm默认的版本符号。 例如：npm install --save sg-utils 会在 package.json 中添加 “sg-utils”: “^1.4.6”。这个符号会告诉npm可以安装 1.4.6 或者一个大于它的版本， 但是要是主版本 1 以下的版本；
- ~ 符号表示可以安装 1.4.6 或者一个大于它的版本， 但是要是次版本号 1.3以下的版本；
- `> `符号用来指定可以安装的 beta 版本；
- 可以通过 npm config set save-prefix='' 来设置默认符号。

## package-lock.json的作用

npm更新到v5.x.x以后，会出现一种新的自动生成文件 package-lock.json，如果打开这个文件，会发现它看着像 package.json 里面的依赖。那么，它究竟是做什么用的呢？

背景：

比如我们的项目用了 sg-utils ，npm install sg-utils --save-dev，我们本地使用的版本是 ^1.4.6，这时 package.json 记录的版本号也是 ^1.4.6；

当有人从 github 上拉取我们的代码，然后初始化项目（或者我们自己有一天也可能再次安装依赖）npm install。这个时候，项目安装的 sg-utils 就是 在主版本 1 以下的最新版本 （比如更新到了 1.4.7，两个版本之前修改了一个bug），那么本地安装的就是 1.4.7；
那么，就会存在多人开发项目，但是本地的依赖版本不一样的情况。虽然只是修改了一个 bug，但仍然有可能影响代码的开发。

package-lock.json 版本锁定

- 当我们安装依赖时，package-lock.json 文件会自动生成。里面会描述上一次更改后的确切的依赖管理树，包含了唯一的版本号和相关的包信息。之后的 npm install 会根据 package-lock.json 文件进行安装，保证不同环境、不同时间下的依赖是一样的；
- 由于 package-lock.json 文件中记录了下载源地址，可以加快我们的 npm install 速度。

