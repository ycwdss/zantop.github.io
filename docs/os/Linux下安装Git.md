# Linux 下安装 Git

## 1、安装

可以执行`yum install git`安装，但是安装的版本太低了，我们还是自己来下载安装包来装。

登录[git 的 github 发布页面](https://github.com/git/git/releases)

- 1、使用`wget https://github.com/git/git/archive/v2.22.0-rc3.tar.gz` 下载到`download`目录下
- 2、压缩包解压，命令为：`tar xvf v2.22.0-rc3.tar.gz`
- 3、安装编译源码所需依赖，命令为：`yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel gcc perl-ExtUtils-MakeMaker` 耐心等待安装，出现提示输入 y 即可；
- 4、安装依赖时，yum 自动安装了 Git，需要卸载旧版本 Git，命令为：`yum remove git`出现提示输入 y 即可；
- 5、进入解压后的文件夹，命令 `cd git-2.22.0-rc3` ，然后执行编译，命令为 `make prefix=/usr/local/git all` 耐心等待编译即可；
- 6、安装 Git 至`/usr/local/git`路径，命令为 `make prefix=/usr/local/git install` ；
- 7、打开环境变量配置文件，命令 vim /etc/profile ，在底部加上 Git 相关配置信息：

`export PATH=$PATH:/usr/local/git/bin`

然后保存，退出！

- 8、终端输入：`source /etc/profile`
- 9、终端输入：`git --version`,显示安装的 git 版本

## 2、远程 git 仓库

- 1、配置用户名`git config --global user.name "ycwdss"`
- 2、配置邮箱`git config --global user.mail "ycwdss@qq.com"`
- 3、生成秘钥 `ssh-keygen -t rsa -C "ycwdsss@qq.com"`
- 4、复制秘钥`cat id_rsa.pub`添加到 gitee 或者 github 上
- 5、测试是否成功 `ssh -T git@gitee.com`

[环境部署（三）：Linux 下安装 Git](https://www.cnblogs.com/imyalost/p/8715688.html)
