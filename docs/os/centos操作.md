# centos 操作

配置 ssh 登录

Mac 下创建 id_rsa_qq.pub, 然后去腾讯云配置下密钥

创建新登录用户

[在 centos7 中添加一个新用户，并授权](https://cloud.tencent.com/developer/article/1058742)
[腾讯云新用户赋予 root 权限](https://blog.csdn.net/wang1144/article/details/70255506)
[【Linux 使用及问题解决】用户登录时显示 -bash-4.2\$ 问题](https://www.cnblogs.com/luxj/p/7654974.html)
[总结：进普通用户出现-bash-4.1\$的解决方法](https://blog.csdn.net/sxkjkoukou/article/details/8982855)

## 1、Centos 查看端口占用情况和开启端口命令

`lsof -i tcp:80` 查看 80 端口的使用情况
`netstat -ntlp` 列出所有端口

1、开启端口（80 端口为例）

方法 1

```js
/sbin/iptables -I INPUT -p tcp --dport 80 -j ACCEPT //修改
/etc/init.d/iptables save //保存修改
service iptables restart  //重启防火墙生效
```

方法 2

```js
vi /etc/sysconfig/iptables //打开文件
-A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT //插入语句
service iptables restart//重启防火墙生效
```

2、关闭端口

方法 1

```js
/sbin/iptables -I INPUT -p tcp --dport 80 -j DROP  //写入
/etc/init.d/iptables save//保存修改
service iptables restart//重启防火墙生效
```

方法 2

```js
vi / etc / sysconfig / iptables; //打开文件
-A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j DROP //添加
service iptables restart //重启防火墙生效
/etc/init.d/iptables status //查看端口状态
```
