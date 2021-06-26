# 搭建 npm 私仓库

基于 docker 安装 [verdaccio](https://verdaccio.org/) 来搭建 npm 私有仓库

## 1、拉取 verdaccio 容器

`docker pull verdaccio/verdaccio`

## 2、运行容器

`docker run -d -it --rm --name verdaccio -p 3005:4873 verdaccio/verdaccio`

浏览器输入`http://118.25.6.141:3005/`可以看到页面了

## 3、设置 npm 源以及账户

本地操作：

**镜像源添加**

`nrm add zan http://118.25.6.141:3005/`

**使用**

`nrm use zan`如果删除`nrm del zan`

**登录**

`npm adduser` 添加用户，并输入用户名，密码，邮箱 此时便已经成功登录了，可以正常发布包到自己私有库

`npm publish`或者`relix`命令去发布 就可以看到了 npm 源了
