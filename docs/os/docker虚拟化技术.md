# docker 虚拟化技术

## 1、docker 与虚拟机

两张图比较 docker 与虚拟机的本质原理区别

![](http://open.zantop.cn/docker1.png)

![](http://open.zantop.cn/docker2.png)

更形象的对比：

**宿主机**
![](https://pic1.zhimg.com/80/v2-2a05f6b780ea9692a459477bbda7b066_hd.jpg)

**虚拟机**
![](https://pic4.zhimg.com/80/v2-a4bd3589de0a0536d73fd53f3403adff_hd.jpg)

**docker 容器**
![](https://pic4.zhimg.com/80/v2-b9430887dc90820af97bb2d35854e34d_hd.jpg)

1. docker 启动快速属于秒级别。虚拟机通常需要几分钟去启动。
2. docker 需要的资源更少，docker 在操作系统级别进行虚拟化，docker 容器和内核交互，几乎没有性能损耗，性能优于通过 Hypervisor 层与内核层的虚拟化。；
3. docker 更轻量，docker 的架构可以共用一个内核与共享应用程序库，所占内存极小。同样的硬件环境，Docker 运行的镜像数远多于虚拟机数量。对系统的利用率非常高
4. 与虚拟机相比，docker 隔离性更弱，docker 属于进程之间的隔离，虚拟机可实现系统级别隔离；
5. 安全性： docker 的安全性也更弱。Docker 的租户 root 和宿主机 root 等同，一旦容器内的用户从普通用户权限提升为 root 权限，它就直接具备了宿主机的 root 权限，进而可进行无限制的操作。虚拟机租户 root 权限和宿主机的 root 虚拟机权限是分离的，并且虚拟机利用如 Intel 的 VT-d 和 VT-x 的 ring-1 硬件隔离技术，这种隔离技术可以防止虚拟机突破和彼此交互，而容器至今还没有任何形式的硬件隔离，这使得容器容易受到攻击。
6. 可管理性：docker 的集中化管理工具还不算成熟。各种虚拟化技术都有成熟的管理工具，例如 VMware vCenter 提供完备的虚拟机管理能力。
7. 高可用和可恢复性：docker 对业务的高可用支持是通过快速重新部署实现的。虚拟化具备负载均衡，高可用，容错，迁移和数据保护等经过生产实践检验的成熟保障机制，VMware 可承诺虚拟机 99.999%高可用，保证业务连续性。
8. 快速创建、删除：虚拟化创建是分钟级别的，Docker 容器创建是秒级别的，Docker 的快速迭代性，决定了无论是开发、测试、部署都可以节约大量时间。
9. 交付、部署：虚拟机可以通过镜像实现环境交付的一致性，但镜像分发无法体系化；Docker 在 Dockerfile 中记录了容器构建过程，可在集群中实现快速分发和快速部署;

**docker 的架构图如下**

![](http://open.zantop.cn/docker.jpg)

从图中可以看出几个组成部分

1. docker client: 即 docker 命令行工具
2. docker host: 宿主机，docker daemon 的运行环境服务器
3. docker daemon: docker 的守护进程，docker client 通过命令行与 docker daemon 交互
4. container: 最小型的一个操作系统环境，可以对各种服务以及应用容器化
5. image: 镜像，可以理解为一个容器的模板配置，通过一个镜像可以启动多个容器
6. registry: 镜像仓库，存储大量镜像，可以从镜像仓库拉取和推送镜像

## 2、安装与卸载

卸载之前的就版本

```js
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

1、安装依赖

```js
yum install -y yum-utils device-mapper-persistent-data lvm2
```

2、添加镜像

```js
//安装 docker 官方的镜像源
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

// 如果在国内，安装阿里云的镜像
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

3、安装 docker

```js
yum install -y docker-ce //社区版
docker --version  //查看版本信息
docker version  //查看更详细的版本号信息
docker info  //查看docker的详细配置信息
```

4、加速配置

- 阿里云（先加入阿里云开发者平台：https://dev.aliyun.com）
- docker 中国加速器（https://www.docker‐cn.com)
- USTC 加速器（https://lug.ustc.edu.cn/wiki/ ）
- daocloud

```js
sudo vim /etc/docker/daemon.json
//配置内容：
{ "registry‐mirrors": ["https://c7rydq9o.mirror.aliyuncs.com"] }

 sudo systemctl daemon‐reload
 sudo systemctl restart docker
```

## 3、docker 基础

1、相关命令

```js
service docker start                             // 开启docker服务
systemctl start docker                           // 启动 docker 后台服务
systemctl stop docker                            //  停止docker 后台服务
systemctl restart docker                         // 重启docker服务
systemctl status docker                          // 查看docker运行状态
systemctl daemon-reload                          // 重启docker守护进程

//镜像操作

docker search jenkins                            // docker搜索镜像
docker pull jenkins                              // docker拉取镜像
docker images                                    // 查看镜像列表
docker ps -a                                     // 查看容器,不加-a查看正在运行的，加上-a查看所有容器
docker rm 容器id                                  // 删除容器
docker rmi 镜像id                                 // 删除镜像
docker rmi $(docker images -q)                    // 删除所有镜像
```

2、容器操作

**创建容器**  
`docker create --name=nginx nginx`

**交互型容器**
`docker run --name centos -it centos /bin/bash`

- i:打开容器的标准输入。
- t:告诉 docker 为容器建立一个命令行终端。
- name:指定容器名称，可以不填(随机)，建议根据具体使用功能命名，便于管理。
- centos:告诉我们使用什么镜像来启动容器。
- /bin/bash:告诉 docker 要在容器里面执行此命令。

**后台型容器**

运行在后台，创建后与终端无关，只有调用 `docker stop`、`docker kill` 命令才能使容器停止

`docker run --name nginx -d -p 8080:80 nginx`

- --name 含义和上文一样，表示创建的容器的名字，
- -d 表示容器在后台运行，
- -p 表示将容器的 80 端口映射到宿主机的 8080 端口

**相关命令：**

```js
//进入容器
docker attach 容器名称/id (ps:exit,容器停止)

docker exec -it 容器名称/id /bin/bash （ps:exit,容器不会停止）
docker ps //查看正在运行的容器
docker ps ‐a //查看运行过的容器（历史）
docker ps ‐l //最后一次运行的容器
docker start 容器名称/id //启动容器
docker stop 容器名称/id //停止容器
docker kill 容器名称/id //强制停止容器
docker rm 容器名称/id //删除容器
docker rm 容器名称/id 容器名称/id //删除多个容器
docker rm `docker ps ‐a ‐q` //删除所有容器
docker logs 容器名称/id //查看容器日志
docker inspect 容器 ID/容器别名 // 查看一个容器的详情
docker rename 原容器名 新容器名 //重命名
ctrl + p + q //退出容器回到宿主机
```

**文件拷贝**

将文件拷贝到容器内：docker cp 需要拷贝的文件或目录 容器名称:容器目录  
`docker cp 1.txt c2:/root`

将容器内文件拷贝到宿主机：docker cp 容器名称:容器目录 需要拷贝的文件或目录  
`docker cp c2:/root/1.txt /root`

**目录挂载**

我们可以在创建容器的时候，将宿主机的目录与容器内的目录进行映射，这样我们就可 以通过修改宿主机某个目录的文件从而去影响容器。

创建容器 添加-v 参数 后边为 宿主机目录:容器目录

`docker run ‐id ‐‐name=c4 ‐v /opt/:/usr/local/myhtml centos`

如果你共享的是多级的目录，可能会出现权限不足的提示 `permission denied`

这是因为 CentOS7 中的安全模块 selinux 把权限禁掉了，我们需要添加参数 `-- privileged=true` 来解决挂载的目录没有权限的问题

`docker run ‐id ‐‐privileged=true ‐‐name=c4 ‐v /opt/:/usr/local/myhtml centos`

## 4、镜像制作

docker 官方和个人发布的镜像由于版本等各种原因，漏洞较多，已统计 Docker Hub 超过 30%的官方镜像包含高危漏洞。此外，由于网络等原因也会造成 docker pull 下载镜像的 速度很慢。基于这种情况，我们可以手动定制 docker 系统镜像。

构建镜像的方式有两种：

1. 使用 docker commit 命令
2. Dockerfile 文件

### 4.1 commit 制作镜像

拉取一个基础镜像  
`docker pull centos`
创建交互型容器  
`docker run ‐it ‐‐name=nodenv centos`  
下载 node 文件，提示找不到 wget 命令，先安装 wget
`yum -y install wget`

打开容器`/opt/`目录，下载 node 源文件

```jswget https://npm.taobao.org/mirrors/node/v12.14.1/node-v12.14.1-linux-x64.tar.gz
tar -zxvf node-v12.14.1-linux-x64.tar.gz //解压
//配置软连接
ln - s / opt / node / bin / node / usr / local / bin / node;
ln - s / opt / node / bin / npm / usr / local / bin / npm;
```

`node -v`可以看到当前容器安装的 `node`版本

将正在运行的容器提交为一个新的镜像 `docker commit nodenv nodenvi`

`docker images`就可以看到制作的镜像

```js
[root@VM_0_11_centos ~]# docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
nginx latest c7460dfcab50 10 days ago 126MB
nodenvi latest 946e37cfe78b 11 days ago 333MB
```

### 4.2 Dockerfile 文件制作镜像

什么是 dockerfile?

Dockerfile 是一个包含用于组合映像的命令的文本文档。可以使用在命令行中调用任何命令。 Docker 通过读取 Dockerfile 中的指令自动生成映像。

docker build 命令用于从 Dockerfile 构建映像。可以在 docker build 命令中使用-f 标志指向文件系统中任何位置的 Dockerfile。

例：`docker build -f /path/to/a/Dockerfile`

**Dockerfile 的基本结构:**

一般分为四部分：基础镜像信息、维护者信息、镜像操作指令和容器启动时执行指令，’#’ 为 Dockerfile 中的注释。

Dockerfile 文件说明:

Docker 以从上到下的顺序运行 Dockerfile 的指令。为了指定基本映像，第一条指令必须是 FROM。一个声明以＃字符开头则被视为注释。可以在 Docker 文件中使用 RUN，CMD，FROM，EXPOSE，ENV 等指令。
![](http://open.zantop.cn/911490-20171208222222062-849020400.png)

```js
FROM:指定基础镜像，必须为第一个命令
格式：
　　 FROM <image>
　　 FROM <image>:<tag>
　　 FROM <image>@<digest>
示例：
　　 FROM mysql:5.6
注：
　　 tag 或 digest 是可选的，如果不使用这两个值时，会使用 latest 版本的基础镜像
MAINTAINER: 维护者信息
 格式：
MAINTAINER <name>
示例：
MAINTAINER Jasper Xu
MAINTAINER sorex@163.com
MAINTAINER Jasper Xu <sorex@163.com>
RUN:构建镜像时执行的命令
 RUN 用于在镜像容器中执行命令，其有以下两种命令执行方式：
shell 执行
格式：
RUN <command>
exec 执行
格式：
RUN ["executable", "param1", "param2"]
示例：
RUN ["executable", "param1", "param2"]
RUN apk update
RUN ["/etc/execfile", "arg1", "arg1"]
注：
　　 RUN 指令创建的中间镜像会被缓存，并会在下次构建中使用。如果不想使用这些缓存镜像，可以在构建时指定--no-cache 参数，如：docker build --no-cache
ADD:将本地文件添加到容器中，tar 类型文件会自动解压(网络压缩资源不会被解压)，可以访问网络资源，类似 wget

格式：
ADD <src>... <dest>
ADD ["<src>",... "<dest>"] 用于支持包含空格的路径
示例：
ADD hom_ /mydir/ # 添加所有以"hom"开头的文件
ADD hom?.txt /mydir/ # ? 替代一个单字符,例如："home.txt"
ADD test relativeDir/ # 添加 "test" 到 `WORKDIR`/relativeDir/
ADD test /absoluteDir/ # 添加 "test" 到 /absoluteDir/
COPY:功能类似 ADD，但是是不会自动解压文件，也不能访问网络资源
CMD:构建容器后调用，也就是在容器启动时才进行调用。
 格式：
CMD ["executable","param1","param2"](执行可执行文件，优先)
CMD ["param1","param2"](设置了ENTRYPOINT，则直接调用ENTRYPOINT添加参数)
CMD command param1 param2 (执行 shell 内部命令)
示例：
CMD echo "This is a test." | wc -
CMD ["/usr/bin/wc","--help"]
注：
　　 CMD 不同于 RUN，CMD 用于指定在容器启动时所要执行的命令，而 RUN 用于指定镜像构建时所要执行的命令。

ENTRYPOINT:配置容器，使其可执行化。配合 CMD 可省去"application"，只使用参数。
 格式：
ENTRYPOINT ["executable", "param1", "param2"] (可执行文件, 优先)
ENTRYPOINT command param1 param2 (shell 内部命令)
示例：
FROM ubuntu
ENTRYPOINT ["top", "-b"]
CMD ["-c"]
注：
　　　 ENTRYPOINT 与 CMD 非常类似，不同的是通过 docker run 执行的命令不会覆盖 ENTRYPOINT，而 docker run 命令中指定的任何参数，都会被当做参数再次传递给 ENTRYPOINT。Dockerfile 中只允许有一个 ENTRYPOINT 命令，多指定时会覆盖前面的设置，而只执行最后的 ENTRYPOINT 指令。
LABEL:用于为镜像添加元数据
 格式：
LABEL <key>=<value> <key>=<value> <key>=<value> ...
示例：
　　 LABEL version="1.0" description="这是一个 Web 服务器" by="IT 笔录"
注：
　　使用 LABEL 指定元数据时，一条 LABEL 指定可以指定一或多条元数据，指定多条元数据时不同元数据之间通过空格分隔。推荐将所有的元数据通过一条 LABEL 指令指定，以免生成过多的中间镜像。
ENV:设置环境变量
 格式：
ENV <key> <value> #<key>之后的所有内容均会被视为其<value>的组成部分，因此，一次只能设置一个变量
ENV <key>=<value> ... #可以设置多个变量，每个变量为一个"<key>=<value>"的键值对，如果<key>中包含空格，可以使用\来进行转义，也可以通过""来进行标示；另外，反斜线也可以用于续行
示例：
ENV myName John Doe
ENV myDog Rex The Dog
ENV myCat=fluffy
EXPOSE:指定于外界交互的端口
 格式：
EXPOSE <port> [<port>...]
示例：
EXPOSE 80 443
EXPOSE 8080
EXPOSE 11211/tcp 11211/udp
注：
　　 EXPOSE 并不会让容器的端口访问到主机。要使其可访问，需要在 docker run 运行容器时通过-p 来发布这些端口，或通过-P 参数来发布 EXPOSE 导出的所有端口 \*/
VOLUME:用于指定持久化目录

 格式：
VOLUME ["/path/to/dir"]
示例：
VOLUME ["/data"]
VOLUME ["/var/www", "/var/log/apache2", "/etc/apache2"
注：
　　一个卷可以存在于一个或多个容器的指定目录，该目录可以绕过联合文件系统，并具有以下功能：
卷可以容器间共享和重用
容器并不一定要和其它容器共享卷
修改卷后会立即生效
对卷的修改不会对镜像产生影响
卷会一直存在，直到没有任何容器在使用它
WORKDIR:工作目录，类似于 cd 命令
 格式：
WORKDIR /path/to/workdir
示例：
WORKDIR /a (这时工作目录为/a)
WORKDIR b (这时工作目录为/a/b)
WORKDIR c (这时工作目录为/a/b/c)
注：
　　通过 WORKDIR 设置工作目录后，Dockerfile 中其后的命令 RUN、CMD、ENTRYPOINT、ADD、COPY 等命令都会在该目录下执行。在使用 docker run 运行容器时，可以通过-w 参数覆盖构建时所设置的工作目录。
USER:指定运行容器时的用户名或 UID，后续的 RUN 也会使用指定用户。使用 USER 指定用户时，可以使用用户名、UID 或 GID，或是两者的组合。当服务不需要管理员权限时，可以通过该命令指定运行用户。并且可以在之前创建所需要的用户

格式:
　　 USER user
　　 USER user:group
　　 USER uid
　　 USER uid:gid
　　 USER user:gid
　　 USER uid:group
示例：
　　 USER www
注：
　　使用 USER 指定用户后，Dockerfile 中其后的命令 RUN、CMD、ENTRYPOINT 都将使用该用户。镜像构建完成后，通过 docker run 运行容器时，可以通过-u 参数来覆盖所指定的用户。
ARG:用于指定传递给构建运行时的变量
 格式：
ARG <name>[=<default value>]
示例：
ARG site
ARG build_user=www
ONBUILD:用于设置镜像触发器
 格式：
　　 ONBUILD [INSTRUCTION]
示例：
　　 ONBUILD ADD . /app/src
　　 ONBUILD RUN /usr/local/bin/python-build --dir /app/src
注：
　　当所构建的镜像被用做其它镜像的基础镜像，该镜像中的触发器将会被钥触发
```

**示例结合 Jenkins 自动构建 node 项目：**

在 node 项目根目录下创建 Dockerfile 文件

```js
# Version 1.0
# Base images 基础镜像

FROM node:latest #维护者信息
MAINTAINER wz #相当于 cd 指定工作目录或者称当前目录，如果目录不存在，会自动建立
WORKDIR /home/node/nest-hello

# 拷贝 package.json 文件到工作目录

# !!重要：package.json 需要单独添加。

# Docker 在构建镜像的时候，是一层一层构建的，仅当这一层有变化时，重新构建对应的层。

# 如果 package.json 和源代码一起添加到镜像，则每次修改源码都需要重新安装 npm 模块，这样木有必要。

# 所以，正确的顺序是: 添加 package.json；安装 npm 模块；添加源代码。

COPY package\*.json ./

# 安装项目依赖

RUN npm install --registry=https://registry.npm.taobao.org

# 将上下文里到项目文件拷贝到工作目录

COPY . ./

# 暴露容器端口

EXPOSE 3000

# 启动 node

CMD npm run build && npm run start:prod
```

可以看到创建的`nest/hello`镜像

```js
[root@VM_0_11_centos ~]# docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
nest/hello latest 50931be132fd 31 seconds ago 1.17GB
```

创建 `setup.sh` 命令来创建容器并启动容器

```js
#打开源代码目录
cd /var/jenkins_home/workspace/node-nest-hello
# 停止之前的 docker container
docker stop nesthello #删除这个 container
docker rm nesthello
# 删除这个 container
docker rmi nest/hello:latest
# 打包镜像
docker build -t nest/hello .
# 镜像目录
docker images
# 运行容器
docker run -d -u 0 --privileged --restart always --name nesthello -p 3004:3000 -v /var/jenkins_home/workspace/node-nest-hello:/home/node/node-nest-hello nest/hello:latest
# 日志
docker logs nesthello

```

jenkins 对应配置
![](http://open.zantop.cn/Xnip2020-01-27_13-28-13.jpg)
上传代码到仓库 Jenkins 自动构建，查看容器

```js
[root@VM_0_11_centos ~]# docker ps -a
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
65ea3ad81943 nest/hello:latest "docker-entrypoint.s…" About a minute ago Up About a minute 0.0.0.0:3004->3000/tcp nesthello
```

浏览器输入`http://118.25.6.141:3004/`可以访问了

**↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑**

## 5、jenkins 自动构建项目

![](http://open.zantop.cn/docker20200120-225645@2x.png)

### 5.1 安装

查询 jenkins 镜像

`docker search jenkins`

拉取最新 jenkins

`docker pull jenkins:latest`

创建文件`/home/jenkins`,设置权限 `sudo chown 777 /home/jenkins`

启动容器

```js
docker run -d -u 0 --privileged --name jenkins -p 3002:8080 -v /home/jenkins:/var/jenkins_home jenkins:latest
```

- -u 0 指的是传入 root 账号 ID，覆盖容器中内置的账号
- -v /home/jenkins:/var/jenkins_home 指的是将 docker 容器内的目录/var/jenkins_home 映射到宿主机/home/jenkins 目录上
- --name jenkins 将容器命名为 jenkins
- -p 3002:8080 端口映射，将容器的 8080 端口映射到宿主机的 49003 端口
- --privileged 赋予最高权限

**整条命令的意思:**  
运行一个镜像为 jenkins 的容器，命名为 jenkins，将容器的`/var/jenkins_home` 映射到宿主机的`/home/jenkins`目录下，映射容器中 8080 端口到宿主机 3002 端口

**查看 jenkins**

执行完成后，等待几十秒，等待 jenkins 容器启动初始化。 可以查看宿主机/home/jenkins 下是否多了很多文件 到浏览器中输入 localhost:3002 查看 jenkins 是否启动成功

**获取密码**

`cat /home/jenkins/secrets/initialAdminPassword;`

浏览器打开地址，输入密码进入，安装社区推荐插件。

### 5.2 配置 jenkins SSH

这里的 SSH 是为容器配置的，可以让 jenkins 从 github 网站拉取代码

1、进入容器 jenkins 的内部

`docker exec -it jenkins /bin/bash`

2、生成 ssh 的密钥文件

`ssh-keygen -t rsa -C "wwww@163.com" //连续按三次回车就好`

3、退出容器复制 `/home/jenkins/.ssh/id_rsa.pub` 到主机目录下的`.ssh/authorized_keys` 中

```js
exit && cd ~ //退出容器
cd .ssh //进入根目录.ssh
cat /home/jenkins/.ssh/id_rsa.pub >> authorized_keys //复制秘钥
```

可以看到`authorized_keys`多了一个 ssh 秘钥

4、重启 SSH 服务

`systemctl restart sshd.service`

5、将公钥配置到你的 `github/gitlab` 的 `SSH setting`中

### 5.3 配置 jenkins 插件

**1、安装 Publish Over SSH 插件**

首页 -> 点击系统管理 -> 管理插件 ->可选插件 -> 过滤：ssh -> 选择 Publish Over SSH 插件，点击直接安装

**2、配置 SSH**

系统管理 -> 系统设置 -> 下拉，找到 Publish over SSH

这里就是项目打包编译好后发送到哪个服务器的哪个目录

点击下测试，如果成功了就保存，错误一般是密码不对

**3、配置 node 插件**

因为我们的 node 项目需要 node 编译打包，所以安装下 node 插件 系统配置-插件管理-可选插件，搜索 nodejs，直接安装

然后去系统配置-全局工具管理-nodejs，配置几个你要用到的 node 版本

如果看到此错误，进入 jenkins 容器 检查是否安装了 git

`git --version`  
`which git` //如果安装查看路径，在上面错误路径中输入此路径
如果没有安装 git,在 jenkins 中 安装 git

### 5.4 安装 nginx

docker 安装 nginx

`docker pull nginx`

启动 nginx 容器

`docker run -d -p 3003:80 --name nginx nginx`

挂载配置文件

因为第二步运行的 Nginx 的配置文件是在容器内部的，不方便修改，所以我们可以先把容器内的配置文件复制到宿主机

创建 nginx 工作目录

`mkdir -p var/nginx/conf var/nginx/www var/nginx/logs`

拷贝 docker 配置文件到宿主机工作目录

`docker cp -a nginx:/etc/nginx/nginx.conf /var/nginx/conf`

重启 nginx 容器

```js
//首先停止之前的容器并删除
docker stop nginx
docker rm nginx
//重新启动容器并挂载工作目录
docker run -d --restart always -p 3003:80 -v /var/nginx/www:/usr/share/nginx/html -v /var/nginx/conf/nginx.conf:/etc/nginx/nginx.conf -v /var/nginx/logs:/var/log/nginx --name nginx nginx

--restart always // 表示 docker 重启时会自动重启该容器
-v /var/nginx/www:/usr/share/nginx/html // 映射容器默认静态页面路径
-v /var/nginx/conf/nginx.conf:/etc/nginx/nginx.conf // 映射容器配置文件
-v /var/nginx/logs:/var/log/nginx // 映射容器日志目录
```

再去访问你的服务器 ip 发现 403,是因为 www 目录无内容，去新建一个 index.html 看下

```js
// cd /var/nginx/www
//touch index.html
inde.html 里内容如下：

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <h1>海上生明月，天涯共此时。</h1>
</body>
</html>
// 发现再去访问就能看到这个页面了
```

### 5.5 构建 web 项目

1、新建任务-填写任务名称-构建一个自由风格的软件项目

2、源码管理
前边第四步已经配置过 SSH，这里可以使用 SSH 协议的 git 项目地址 出现上图报错，检查 jenkins 容器内是否安装了 git 或者版本是否过低，进入到 jenkins 容器内，查看 git 版本

```js
[root@iZgm2xqy8dx52vZ ~]# docker exec -it jenkins /bin/bash
jenkins@8f133f801f50:/$   git --version     // jenkins@8f133f801f50:/$代表在 jenkins 容器内
v2.11.0
```

![](http://open.zantop.cn/blog20200117-163824@2x.png)
如果没有安装，去系统配置-全局工具配置-git，勾选自动安装试试，另外可 如果 git 版本过低，可以试试下面 jenkins 中安装/卸载/重装 git 的操作。
![](http://open.zantop.cn/blog20201171633.png)
如果容器的 git 没问题，ssh 也配置过，还是报错的话，就把项目 git 地址换成 https 的，没有问题就再切回 ssh 协议的。 如果还有问题！！！
![](http://open.zantop.cn/blog20200117-165649@2x.png)
然后发现，呦吼，终于可以了！

3、构建环境

选择你配置的 node 插件
![](http://open.zantop.cn/blog20200117-164040@2x.png)
4、构建

web 项目，删除依赖-重新安装依赖-打包编译-压缩
![](http://open.zantop.cn/blog20200117-164154@2x.png)
5、构建后操作

打包编译后发送到要部署的服务上，最终的传输路径为 SSH 服务器的 Remote directory+这里的 Remote directory，比如我前边配置的是根目录/，这里是/home/umiPc, 所以 最终发送的路径为：要部署的 SSH 服务器的/home/umiPc，可以去该服务器的目录中查看一下。
![](http://open.zantop.cn/blog20200117-165649@2x.png)
6、执行构建操作

文件权限不足，解决方法如下：

`chmod -R 777 /var/jenkins_home/workspace`

node 版本不合适，切换其他版本

构建失败，拉取项目超时

`ERROR: Timeout after 10 minutes ERROR: Error cloning remote repo 'origin'`

可以去如下设置超时时间和拉取代码配置
![](http://open.zantop.cn/blog20200117-170832@2x.png)
点击立即构建，等一会，不出意外的话，项目构建成功。 构建细节我们可以观察本次构建的控制台输出( Console Output) 来观察项目的执行过程。 这里构建可能失败，这里记录几种常见错误：

7、自动构建

代码 push 到 git 仓库，自动构建，以 gitee 为例子

jenkins gitee 自动构建配置

[docker + jenkins 部署完整 node 项目](https://juejin.im/post/5e0ad7a06fb9a0482c4e9d22#heading-40)
