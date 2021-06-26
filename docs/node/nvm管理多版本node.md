[使用 nvm 管理多版本 Node](https://www.jianshu.com/p/ac6e4397c9f0)

[nvm github 文档](https://github.com/nvm-sh/nvm/blob/master/README.md)

- default nvm 默认使用的版本
- node 和 stable 当前安装的 node 的最新的稳定版本
- iojs iojs 的最新稳定版本
- lts/\* node lts 系列最新的稳定版本
- lts/argon,lts/boron,lts/carbon 分别指 lts 的三个大的版本的最新版本

`nvm ls-remote --lts` 列出所有可用版本

`nvm install v4.8.7` 安装对应的版本

`nvm ls`列出已安装的版本

`nvm use lts/boron`可以使用版本或者版本号来切换

`nvm alias default lts/boron` 设置为默认版本
