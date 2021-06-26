# 腾讯云服务器部署 nodejs 项目

## 1、安装 nodejs

1、登录服务器

>     mac下首先打开终端，然后输入sudo su - 回车进入根目录
>     然后输入：ssh -p 端口号 服务器用户名@ip （例如ssh -p 22 userkunyu@119.29.37.63
>     ）回车，到这会让你输入yes或者no来确认是否连接，输入yes回车
>
>     然后输入在服务器上的用户密码回车
>
>     到此进入的是你在服务器上的账户的目录，即为连接成功

如果重装过系统后连不上服务器，
`ssh-keygen -R 服务器端的ip地址`

先更新一下（第一次使用服务器先更新下）

```js
yum update -y
```

2、下载 nodejs
从 nodejs 官网获取下载对应操作系统的连接

```js
wget https://nodejs.org/dist/v8.10.0/node-v8.10.0-linux-x64.tar.xz
```

wget 命令下载 Node.js 安装包。
下载完成后可以看到服务器目录下有了 nodejs 的安装包。

![image](https://note.youdao.com/yws/api/personal/file/WEBd948bbbee14bac29686cd5567f115996?method=download&shareKey=13251730111ccb0ae57ad44e98106edb)

解压该安装包

```js
tar xvf node-v8.10.0-linux-x64.tar.xz
```

在服务器目录可以看到解压后的文件

![image](https://note.youdao.com/yws/api/personal/file/WEBac7846a5b2cd7ece89a56ed28b5ba4bd?method=download&shareKey=b95dbddd68e1e803561ee122bc018dd5)

node 默认安装在/root/node-v8.10.0-linux-x64/目录下,
将 node 安装到其他目录（如：/opt/node/）下，

拓展：

[linux centos 各目录文件解释](https://blog.csdn.net/tthawk/article/details/54912671)

[Linux 目录结构](https://www.centoschina.cn/9932.html)

```js
mkdir -p /opt/node/
mv /root/node-v8.10.0-linux-x64/* /opt/node/
```

![image](https://note.youdao.com/yws/api/personal/file/WEB13a5976903749f11a7c58aa040b4385d?method=download&shareKey=e42b23bc19915eee44d3c63fa81b8e89)

删除/root/node-v8.10.0-linux-x64/安装包

```js
rm -rf /root/node-v8.10.0-linux-x64/
```

该安装包是编译好的文件，解压之后，在 bin 文件夹中就已存在 node 和 npm，无需重复编译。

3.创建软链接，使 node 和 npm 命令全局有效。通过创建软链接的方法，使得在任意目录下都可以直接使用 node 和 npm 命令：

```js
ln - s / opt / node / bin / node / usr / local / bin / node;
ln - s / opt / node / bin / npm / usr / local / bin / npm;
```

4、安装 cnpm

```js
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

配置环境变量，全局命令

```js
ln - s / opt / node / bin / cnpm / usr / local / bin / cnpm;
```

这时 输入 node -v 就会看到版本信息了

5、在 linux 上安装好 nodejs 后,使用 npm install 命令安装项目相关依赖一直都报 permission denied 权限未定义的问题，我本身就是 root 用户了。

解决办法 ,需要这个命令。

```js
npm install --unsafe-perm=true --allow-root
```

## 2、安装 pm2

pm2 是一个带有负载均衡功能的 Node 应用的进程管理器.当你要把你的独立代码利用全部的服务器上的所有 CPU,并保证进程永远都活着,0 秒的重载。

我们在本地运行 node 项目，只是 node serve.js 就可以跑起来了，但是如果关掉，项目就不能运行了，pm2 解决了这一问题，使进程常驻。

安装 pm2

```js
npm install pm2@latest -g
```

创建软链接，使 pm2 命令全局有效

```js
ln - s / opt / node / bin / pm2 / usr / local / bin / pm2;
```

输入 pm2 -v 可以看到版本信息了

## 3、安装 mongodb

1、下载 mongodb

```js
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.6.3.tgz
```

2、解压下载的包

```js
tar -zxvf mongodb-linux-x86_64-3.6.3.tgz
```

3、重命名 mongodb-linux-x86_64-3.6.3

```js
mv mongodb-linux-x86_64-3.6.3 mongodb3.6.3
```

4、在/usr/local 下创建 mongodb 目录

```js
mkdir -p mongodb
```

5、将 mongodb3.6.3 移动到 /usr/local/mongodb 目录中：

```js
mv /mongodb3.6.3/ /usr/local/mongodb
或复制 cp -r
```

6、在 /usr/local/mongodb/mongodb3.6.3/ 目录中创建一个存放数据与日志的目录：

```js
mkdir -p data/koa2-blog/db
mkdir -p data/koa2-blog/log
```

7、在 /usr/local/mongodb/mongodb3.6.3/conf 目录中创建配置文件 mongodb.conf：

```js
mkdir -p conf
vim mongodb.conf
```

mongodb.conf

```js
# 设置端口号（默认的端口号是 27017）
port = 27018

#远程连接要指定ip 不然无法连接。0.0.0.0不限制ip访问,并开启对应端口
bind_ip=0.0.0.0

# 设置数据文件的存放目录
dbpath = /usr/local/mongodb/mongodb3.6.3/data/koa2-blog/db

# 设置日志文件的存放目录及其日志文件名
logpath = /usr/local/mongodb/mongodb3.6.3/data/koa2-blog2/log/mongodb.log

# 设置每个数据库将被保存在一个单独的目录
directoryperdb = true

# 设置为以守护进程的方式运行，即在后台运行
fork = true

# 日志追加
logappend=true

# 访问权限
auth=false
```

参数解释：

```js
参数解释:
--dbpath 数据库路径(数据文件)
--logpath 日志文件路径
--master 指定为主机器
--slave 指定为从机器
--source 指定主机器的IP地址
--pologSize 指定日志文件大小不超过64M.因为resync是非常操作量大且耗时，最好通过设置一个足够大的oplogSize来避免resync(默认的 oplog大小是空闲磁盘大小的5%)。
--logappend 日志文件末尾添加，即使用追加的方式写日志
--journal 启用日志
--port 启用端口号
--fork 在后台运行
--only 指定只复制哪一个数据库
--slavedelay 指从复制检测的时间间隔
--auth 是否需要验证权限登录(用户名和密码)
--syncdelay 数据写入硬盘的时间（秒），0是不等待，直接写入
--notablescan 不允许表扫描
--maxConns 最大的并发连接数，默认2000
--pidfilepath 指定进程文件，不指定则不产生进程文件
--bind_ip 绑定IP，绑定后只能绑定的IP访问服务
```

8、自定义服务

在/lib/systemd/system/目录下新建 mongodb.service 文件，内容如下

```js
[Unit]
     Description=mongodb
     After=network.target remote-fs.target nss-lookup.target
[Service]
     Type=forking
     ExecStart=/usr/local/mongodb/mongodb3.6.3/bin/mongod -f /usr/local/mongodb/mongodb3.6.3/conf/mongodb.conf
     ExecReload=/bin/kill -s HUP $MAINPID
     ExecStop=/usr/local/mongodb/mongodb3.6.3/bin/mongod --shutdown -f /usr/local/mongodb/mongodb3.6.3/conf/mongodb.conf
     PrivateTmp=true
[Install]
    WantedBy=multi-user.target
```

9、设置权限

```js
chmod 754 mongodb.service
```

10、启动关闭服务，设置开机启动

```js
#启动服务
systemctl start mongodb.service
#关闭服务
systemctl stop mongodb.service
#开机启动
systemctl enable mongodb.service
# 查看状态
systemctl status mongodb.service
# 如果mongodb.service配置错误 在更改后记得重新加载文件
systemctl daemon-reload
```

11、设置 mongo,mongod 命令为全局有效

```js
ln -s /usr/local/mongodb/mongodb3.6.3/bin/mongo  /usr/local/bin/mongo
ln -s /usr/local/mongodb/mongodb3.6.3/bin/mongod  /usr/local/bin/mongod
```

连接数据库成功

```js
[root@VM_0_11_centos ~]# mongo --port=27018
MongoDB shell version v3.6.3
connecting to: mongodb://127.0.0.1:27018/
MongoDB server version: 3.6.3
Server has startup warnings:
2018-03-27T13:14:24.748+0800 I STORAGE  [initandlisten]
2018-03-27T13:14:24.748+0800 I STORAGE  [initandlisten] ** WARNING: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine
2018-03-27T13:14:24.748+0800 I STORAGE  [initandlisten] **          See http://dochub.mongodb.org/core/prodnotes-filesystem
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten] ** WARNING: You are running this process as the root user, which is not recommended.
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten]
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten]
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten] ** WARNING: /sys/kernel/mm/transparent_hugepage/enabled is 'always'.
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten] **        We suggest setting it to 'never'
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten]
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten] ** WARNING: /sys/kernel/mm/transparent_hugepage/defrag is 'always'.
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten] **        We suggest setting it to 'never'
2018-03-27T13:14:27.801+0800 I CONTROL  [initandlisten]
>
```

12、设置数据库访问权限

步骤一：进入 admin 表

```js
 use admin
```

步骤二：创建一个超级管理账户

```js
db.createUser({user:"admin",pwd:"wz123",roles:[{role:"userAdminAnyDatabase", db: "admin"}]})
Successfully added user: {
	"user" : "admin",
	"roles" : [
		{
			"role" : "userAdminAnyDatabase",
			"db" : "admin"
		}
	]
}
```

步骤三：开启权限验证
在/usr/local/mongodb/mongodb3.6.3/conf/mongodb.conf 中设置

```js
# 访问权限
auth=true
```

重启 mongodb 服务后再连接数据库，show users 查看所有用户，可以看到出错了，需要验证管理员的权限。

```js
[root@VM_0_11_centos ~]# mongo --port=27018
MongoDB shell version v3.6.3
connecting to: mongodb://127.0.0.1:27018/
MongoDB server version: 3.6.3
> use admin
switched to db admin
> show users
2018-03-27T14:10:38.323+0800 E QUERY    [thread1] Error: not authorized on admin to execute command { usersInfo: 1.0, $db: "admin" } :
_getErrorWithCode@src/mongo/shell/utils.js:25:13
DB.prototype.getUsers@src/mongo/shell/db.js:1686:1
shellHelper.show@src/mongo/shell/utils.js:799:9
shellHelper@src/mongo/shell/utils.js:706:15
@(shellhelp2):1:1
>
```

权限验证后，可以查看用户 users 了

```js
> db.auth('admin','wz123')
1
> show users
{
	"_id" : "admin.admin",
	"user" : "admin",
	"db" : "admin",
	"roles" : [
		{
			"role" : "userAdminAnyDatabase",
			"db" : "admin"
		}
	]
}
```

这里对 admin 创建的 admin 用户，仅仅只有特权去管理用户和角色，
如果你试图执行其他任何操作，例如在 test 数据库中的 foo 集合中去读数据，mongodb 将返回错误。

你创建用户的数据库（这里就是 test 数据库）是该用户认证数据库。尽管用户认证是这个数据库，用户依然可以有其他数据库的角色。即用户认证数据库不限制用户权限。

权限角色有以下几种：

**内建的角色**

**数据库用户角色**

- read: 只读数据权限
- readWrite:学些数据权限

**数据库管理角色**

- dbAdmin: 在当前 db 中执行管理操作的权限
- dbOwner: 在当前 db 中执行任意操作
- userADmin: 在当前 db 中管理 user 的权限

**备份和还原角色**

- backup
- restore

**夸库角色**

- readAnyDatabase: 在所有数据库上都有读取数据的权限
- readWriteAnyDatabase: 在所有数据库上都有读写数据的权限
- userAdminAnyDatabase: 在所有数据库上都有管理 user 的权限
- dbAdminAnyDatabase: 管理所有数据库的权限

**集群管理**

- clusterAdmin: 管理机器的最高权限
- clusterManager: 管理和监控集群的权限
- clusterMonitor: 监控集群的权限
- hostManager: 管理 Server

**超级权限**

- root: 超级用户

mongodb 默认的权限认证是`auth:false`的，如果自己已经设置了`auth:true`，更改角色权限的时候，要先关闭 auth 认证

步骤四：创建数据库，并给此数据库设置访问权限

给数据库 koa2 设置读写的权限

```js
[root@VM_0_11_centos ~]# mongo --port=27018
MongoDB shell version v3.6.3
connecting to: mongodb://127.0.0.1:27018/
MongoDB server version: 3.6.3
> use admin
switched to db admin
> db.auth('admin','wz123')
1
> use koa2
switched to db koa2
> db.createUser({user:'wz',pwd:'wz123',roles:[{role:'readWrite',db:'koa2'}]})
Successfully added user: {
	"user" : "wz",
	"roles" : [
		{
			"role" : "readWrite",
			"db" : "koa2"
		}
	]
}
>
```

步骤五 写测试数据，Robo 3T 连接数据库

像 koa2 数据库中写入一个 test 集合

```js
db.test.insert({ title: '测试', name: '大王', age: 12 });
```

阿里云服务器要配置安全组规则

打开 RoBo 3T 连接数据库，可以看到集合 collection 有 test

![image](https://note.youdao.com/yws/api/personal/file/WEB91bc63e046854f8706436e5aa22537d2?method=download&shareKey=28ed468b4c880825474f5ddadbec2588)

## 4、安装 ngnix

```js
yum install ngnix
```

1.  #启动 ngnix 服务
2.  systemctl start ngnix.service /service nginx start
3.  #停止 ngnix 服务
4.  systemctl stop ngnix.service /service nginx stop
5.  #重启 ngnix 服务
6.  systemctl restart ngnix.service
    重新读取 ngnix 配置(这个最常用,不用停止 ngnix 服务就能使修改的配置生效)
7.  systemctl reload ngnix.service

修改/etc/ngnix 下的配置 ngnix.conf
删除所有写入

```js
## 工作模式与连接数上限
events {
    ## 单个进程的最大连接数
    worker_connections 1024;
}

## 设置http 服务器
http {
    //http强制跳转https
    server {
       listen 80;
       server_name wz.zantop.cn;
       rewrite ^(.*) https://$server_name$1 permanent;
     }
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    include /etc/nginx/conf.d/*.conf;

}
```

在/etc/ngnix/conf.d 下新建 lottery.conf

```js
server {
    #比起默认的80 使用了443 默认 是ssl方式  多出default之后的ssl
    listen 443;
    #开启如果把ssl on；这行去掉，ssl写在443端口后面。这样http和https的链接都可以用
    ssl on;
    server_name wz.zantop.cn;
    #配置证书文件路径
    ssl_certificate /etc/nginx/ssl/1_wz.zantop.cn_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/2_wz.zantop.cn.key;

    ## 配置前端文件
    location / {
        root /home/reactTraining/dist;
        index  index.html index.htm;
        try_files $uri /index.html;
    }
     ## 配置后端接口
     location /api {
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header Host $http_host;
           proxy_set_header X-Nginx-Proxy true;
           proxy_set_header Connection "";
           proxy_set_header Cookie $http_cookie;
           proxy_pass http://172.17.0.11:7001;
    }
  }
```

之后重启 ngnix

```js
 systemctl restart ngnix.service
```

[ngnix.conf 全解析](https://blog.csdn.net/sunboy7890/article/details/50681943)

## 5、项目上传到服务器

后端传到/home/koa2-blog/目录下
前端 react 项目也 build 后，传到此目录下

    --koa2-blog
        --build
        --server
        --node_modules
        --package.json

pm2 运行 server.js

[pm2 常用命令](https://yq.aliyun.com/ziliao/43488)

```js
pm2 start server.js
```

在浏览器中打开前端项目，就开看到网站可以访问了

。。。。。。。。。。。。。。。。

## 6、安装 Redis

1、安装

```js
//下载redis安装包
wget http://download.redis.io/releases/redis-4.0.11.tar.gz
//解压redis压缩文件
tar xzf redis-4.0.11.tar.gz
//安装gcc依赖
yum install gcc
//切换到redis的解压目录中
cd redis-4.0.11
//编译安装redis
make MALLOC=libc
//报错了
cc: 错误：../deps/hiredis/libhiredis.a：没有那个文件或目录
cc: 错误：../deps/lua/src/liblua.a：没有那个文件或目录
make[1]: *** [redis-server] 错误 1
make[1]: 离开目录“/down/redis-4.0.11/src”
make: *** [all] 错误 2

//解决办法是:进入源码包目录下的deps目录中执行
make hiredis jemalloc linenoise lua
//返回上级目录
cd redis-4.0.11
//编译
make
```

源码编译成功之后，可以看到如下的提示

```js
[root@VM_0_11_centos redis-4.0.11]# make
cd src && make all
make[1]: 进入目录“/down/redis-4.0.11/src”
    LINK redis-server
    INSTALL redis-sentinel
    CC redis-cli.o
    LINK redis-cli
    CC redis-benchmark.o
    LINK redis-benchmark
    INSTALL redis-check-rdb
    INSTALL redis-check-aof

Hint: It's a good idea to run 'make test' ;)
```

2、开启 Redis 服务

进入到 src 目录下，执行一下命令就可以开启 Redis 的服务

```js
./redis-server
```

启动界面如下：

````js
[root@VM_0_11_centos src]# ./redis-server
8913:C 07 Sep 10:45:16.211 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
8913:C 07 Sep 10:45:16.211 # Redis version=4.0.11, bits=64, commit=00000000, modified=0, pid=8913, just started
8913:C 07 Sep 10:45:16.211 # Warning: no config file specified, using the default config. In order to specify a config file use ./redis-server /path/to/redis.conf
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 4.0.11 (00000000/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 8913
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           http://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

8913:M 07 Sep 10:45:16.212 # WARNING: The TCP backlog setting of 511 cannot be enforced because /proc/sys/net/core/somaxconn is set to the lower value of 128.
8913:M 07 Sep 10:45:16.212 # Server initialized
8913:M 07 Sep 10:45:16.212 # WARNING overcommit_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
8913:M 07 Sep 10:45:16.212 # WARNING you have Transparent Huge Pages (THP) support enabled in your kernel. This will create latency and memory usage issues with Redis. To fix this issue run the command 'echo never > /sys/kernel/mm/transparent_hugepage/enabled' as root, and add it to your /etc/rc.local in order to retain the setting after a reboot. Redis must be restarted after THP is disabled.
8913:M 07 Sep 10:45:16.212 * Ready to accept connections
^C8913:signal-handler (1536288416) Received SIGINT scheduling shutdown...
8913:M 07 Sep 10:46:56.627 # User requested shutdown...
8913:M 07 Sep 10:46:56.627 * Saving the final RDB snapshot before exiting.
8913:M 07 Sep 10:46:56.633 * DB saved on disk
8913:M 07 Sep 10:46:56.633 # Redis is now ready to exit, bye bye..
````

3、几种启动方式

```js
//常规启动方式
./redis-server

//后台启动方式
./redis-server &

//配置文件启动
./redis-server /usr/soft/redis-4.0.11/redis.conf
```

4、启动脚本配置
如果想要启动配置文件，则可以看 根目录下的 utils 包里面的 redis_init_script 文件

5、[redis.conf 配置文件详解](https://www.cnblogs.com/jepson6669/p/9092685.html)

6、[redis centos 配置安装](https://www.cnblogs.com/jepson6669/p/9092634.html)

[参考](http://www.jb51.net/article/136035.htm#comments)

## 7、linux 清除占用端口

linux 下清除占用端口`netstat -tlnp` `kill -9 pid`
