# npm相关

## 1、npm 和yarn比较


| npm                            | yarn                    | 用法                         |
| ------------------------------ | ----------------------- | ---------------------------- |
| npm install                    | yarn install            | 一键安装package.json的所有包 |
| npm install XXX --save / -S    | yarn add XXX            | 安装到dependencies           |
| npm install XXX --save-dev/ -D | yarn add XXX --save-dev | 安装到devDependencies        |
| npm i XXX@[版本号]             | yarn add XXX@[版本号]   | 指定版本号下载更新           |
| npm install XXX --global       | yarn global add XXX     | 全局安装某个包               |
| npm update --global            | yarn updade upgrade     | 更新所有包                   |
| npm uninstall XXX              | yarn remove XXX         | 删除某个包                   |

## 2、区别
npm 缺点

- npm install 慢
- 同一个项目，安装的时候无法保持一致性
  
package.json文件中版本号的特点:

```js
"5.0.3",
"~5.0.3",
"^5.0.3"
```
5.0.3”表示安装指定的5.0.3版本，“～5.0.3”表示安装5.0.X中最新的版本，“^5.0.3”表示安装5.X.X中最新的版本。这就麻烦了，常常会出现同一个项目，有的同事是OK的，有的同事会由于安装的版本不一致出现bug

yarn 优点

速度快：  
  并行安装无论 npm 还是 Yarn 在执行包的安装时，都会执行一系列任务。npm 是按照队列执行每个 package，也就是说必须要等到当前 package 安装完成之后，才能继续后面的安装。而 Yarn 是同步执行所有任务，提高了性能
    
离线模式： 
  如果之前已经安装过一个软件包，用Yarn再次安装时之间从缓存中获取，就不用像npm那样再从网络下载了。
    
安装版本统一：  
  为了防止拉取到不同的版本，Yarn 有一个锁定文件 (lock file) 记录了被确切安装上的模块的版本号。每次只要新增了一个模块，Yarn 就    会创建（或更新）yarn.lock 这个文件。这么做就保证了，每一次拉取同一个项目依赖时，使用的都是一样的模块版本。
  npm 其实也有办法实现处处使用相同版本的 packages，但需要开发者执行 npm shrinkwrap 命令。这个命令将会生成一个锁定文件，在执行 npm install 的时候，该锁定文件会先被读取，和 Yarn 读取 yarn.lock 文件一个道理。npm 和 Yarn 两者的不同之处在于，Yarn 默认会生成这样的锁定文件，而 npm 要通过 shrinkwrap 命令生成 npm-shrinkwrap.json 文件，只有当这个文件存在的时候，packages 版本信息才会被记录和更新。  
更简洁的输出：  
  npm 的输出信息比较冗长。在执行 npm install package 的时候，命令行里会不断地打印出所有被安装上的依赖。相比之下，Yarn 简洁太多：默认情况下，结合了 emoji直观且直接地打印出必要的信息，也提供了一些命令供开发者查询额外的安装信息。  
多注册来源处理：  
   所有的依赖包，不管他被不同的库间接关联引用多少次，安装这个包时，只会从一个注册来源去装，要么是 npm 要么是 bower, 防止出现混乱不一致。  
更好的语义化：   
   yarn改变了一些npm命令的名称，比如 yarn add/remove，感觉上比 npm 原本的 install/uninstall 要更清晰。  

## 3、删除npm包

npm不鼓励任何形式的删除，主要因为我们发布的包可能已经被其他人引用，如果我们删除了此包，其他人在重新安装含有我们包的依赖的工程时，出现找不到包问题。
基于此，npm做了相关的删除限制：

删除的版本24小时后方可重发!
包发布72小时之内才可删除!

```js
npm unpublish taro-cui --force
```

## 4、没权限问题
`npm install Access Denied`

```js
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```
OR
```js
sudo chown -R $(whoami) ~/.npm
```

Anthoer

```js
sudo npm install --unsafe-perm=true --allow-root

sudo npm cache clean --force --unsafe-perm
```

[npm权限问题](https://igniz87.hatenablog.com/entry/2019/07/10/130254)


## 5、发布工具包

[webpack Library的打包](https://www.codercto.com/a/77978.html)  
[webpack-library-starter](https://github.com/krasimir/webpack-library-starter)  
[基于 Webpack 和 ES6 打造 JavaScript 类库](https://m.wang1314.com/doc/webapp/topic/14670647.html)
