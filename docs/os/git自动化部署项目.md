---
title: git 自动部署项目
---

## git hooks

**原理**

客户端 `push`之后会触发 `git hook` 执行 `hook` 下面的 `post-receive`

服务端 通过 `post-receive` 执行 `shell` 脚本将在目录下拉取项目

**在服务器初始化一个远程 git 仓库**

git init 和 git init --bare 的区别

初始化出来的仓库是不一样的，前者初始化的是一个普通的仓库，其中 .git 文件夹是隐藏的，并且能看见该仓库下所有的源码。而后者初始化出来的仓库中的文件，就是 .git 中的文件夹，但不能像前者那样直接浏览或修改仓库中的代码。

使用 git init --bare 初始化一个远程仓库

1. ssh qq 进入服务器，切换目录/home`git init --bare react-githooks.git`

2. 配置 hooks

`cd /home/react-githooks.git/hooks`  
 `cp post-update.sample post-update`  
 `vim post-update`

```js
#!/bin/sh

unset GIT_DIR
DIR_ONE=/home/react-githooks-demo/  #此目录为服务器页面展示目录
cd $DIR_ONE

git init
git remote add origin /home/react-githooks.git
git clean -df
git pull origin master

//pm2 restart xxx  #pm2重启项目即可
```

post-update 添加执行权限：
`chmod +x post-update`

本地仓库添加 remote 源,本地仓库添加远程仓库源之后，一旦本地仓库变更提交就会触发 Git 钩子，驱动自动部署

```js
git init
git remote add origin user@1.2.3.4:/home/react-githooks.git  #添加远程仓库源
//例如git remote add origin ssh://root@41.72.11.11:26244/home/xxx-bare.git  #远程仓库带端口写法
git push origin master
```

**报错：**

```js
git clone root@192.168.126.128:/www/www/code.git

bash: git-upload-pack: command not found
fatal: Could not read from remote repository.
```

这是因为代码服务器上的 git 安装路径是 /usr/local/git，不是默认路径，只需在服务器执行命令
ln -s /usr/local/git/bin/git-upload-pack /usr/bin/git-upload-pack 就可以了
git-receive-pack 之类的错误，很有可能和这个原理是一样的！

[测试页面](http://githooks.zantop.cn/)

## git webhooks

### 构建 node 服务

构建 node 服务项目目录

```js
.
├── deploy.sh
├── index.js
└── package.json
```

创建 node 服务，监听 github、gitee webhooks 接口地址的返回信息

创建文件`/home/webhooks-listen`
`npm init -y`
安装下面对应文件

**github**

```js

npm i -S github-webhook-handler
```

```js
//gitee
npm i —S gitee-webhook-middleware
```

`vim index.js`

```js
//github
var http = require('http');
var spawn = require('child_process').spawn;

// git用
// secret 保持和 GitHub 后台设置的一致
var handler = createHandler({ path: '/webhook', secret: 'webhook' });
var createHandler = require('github-webhook-handler');
// 码云用
// var createHandler = require('gitee-webhook-middleware');
// var handler = createHandler({ path: '/webhook', token: 'webhook' });

http
  .createServer(function (req, res) {
    handler(req, res, function (err) {
      res.statusCode = 404;
      res.end('no such location');
    });
  })
  .listen(6666);
console.log('listen at prot 6666');

handler.on('error', function (err) {
  console.error('Error:', err.message);
});

// 修改push监听事件,用来启动脚本文件
//git是push ，而码云是Push Hook
handler.on('push', function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref,
  );

  runCommand('sh', ['./deploy.sh'], function (txt) {
    console.log(txt);
  });
});

// 启动脚本文件
function runCommand(cmd, args, callback) {
  var child = spawn(cmd, args);
  var resp = 'Deploy OK';
  child.stdout.on('data', function (buffer) {
    resp += buffer.toString();
  });
  child.stdout.on('end', function () {
    callback(resp);
  });
}
```

**gitee**

```js
var http = require('http');
var createHandler = require('gitee-webhook-middleware');
//# post 所需要用到的秘钥
var handler = createHandler({ path: '/webhooks', token: 'webhooks' });

function run_cmd(cmd, args, callback) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args);
  var resp = '';
  child.stdout.on('data', function (buffer) {
    resp += buffer.toString();
  });
  child.stdout.on('end', function () {
    callback(resp);
  });
}
handler.on('error', function (err) {
  console.error('Error:', err.message);
});
//这个地方就是GitHub 和 Gitee 不一样的地方，需要注意
handler.on('Push Hook', function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref,
  );
  // 需要执行的脚本位置
  run_cmd('sh', ['./deploy.sh'], function (text) {
    console.log(text);
  });
});
//服务监听的端口，可以自行修改
try {
  http
    .createServer(function (req, res) {
      handler(req, res, function (err) {
        res.statusCode = 404;
        res.end('no such location');
      });
    })
    .listen(6666);
} catch (err) {
  console.error('Error:', err.message);
}
```

构建自动化脚本文件`deplog.sh`

```js
WEB_PATH='/home/webhooks-demo/' //项目位置
cd $WEB_PATH
//可以书写其他命令
git init
git remote add origin git@gitee.com:ycwdss/webhooks.git
echo "开始拉取代码了"
git pull origin master
echo "完成over！"

```

`pm2 start index.js`就可以了，如果看 `console.log`日志，`pm2 log id`

### 配置 gitee webhooks

配置地址和秘钥，简单自己去配置下就可以了
