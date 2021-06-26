# mongodb 备份与恢复

## 1、备份

使用 `mongodump` 命令备份数据

mongodump 常用参数

```js
db：指定导出的数据库
collection：指定导出的集合
excludeCollection：指定不导出的集合
host ：远程ip
username：开启身份验证后，用户的登录名
password：用户的密码
out（指定输出目录）：如果不使用这个参数，mongodump将输出文件保存在当前工作目录中名为dump的目录中
archive：导出归档文件，最后只会生成一个文件
gzip：压缩归档的数据库文件，文件的后缀名为.gz
```

备份我们一般使用 mongodump 命令。常用的备份命令格式如下：

```js
mongodump -h 127.0.0.1 --port 8888 -d dbname  -o home/mongodb/
mongodump -h 主机：端口 -d 数据库名  -o  备份目录
```

在安装的 mongodb 目录下`/usr/local/mongodb/bin` 执行

```js
./mongodump -h 127.0.0.1:27018 -o /home/mongodbbak
```

要加`./`不然找不到命令,备份到`/home/mongodbbak`目录下了。

## 2、恢复

```js
-h：MongoDB所在服务器IP。
-p：MongoDB所在服务器端口。
-d：需要恢复的数据库实例。
-u : 指定登录用户
-p : 指定登录用户的密码
-c :  指定要恢复的集合
```

```js
./mongorestore -h 主机:端口 -d 要恢复的DB名 备份目录下的db子目录
./mongorestore -h 127.0.0.1:27018  -d training  /home/mongodbbak/training
```

[MongoDB 备份（mongodump）与恢复（mongorestore）](https://www.cnblogs.com/mingerlcm/p/10701752.html)

[数据备份(mongodump)与恢复(mongorestore)流程](https://blog.csdn.net/SHU15121856/article/details/81660357)

[Mongodb 备份与恢复](https://blog.51cto.com/xiaorenwutest/2137022)

[MongoDB 学习（三）索引、备份、恢复和导入导出操作](https://blog.csdn.net/qq_25827845/article/details/54311235)
