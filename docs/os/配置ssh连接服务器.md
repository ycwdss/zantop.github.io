# 配置 ssh 连接服务器

## 1、Mac 终端连接服务器

```
ssh -p 22 root@119.29.37.63
```

然后输入密码就可以连接。

## 2、Mac 配置 SSH 免密登录服务器

本地生成密钥

```js
ssh-keygen -t rsa
```

```js
Generating public/private rsa key pair.
Enter file in which to save the key (/c/Users/Gary/.ssh/id_rsa): /c/Users/Gary/.ssh/id_rsa_tencent
<剩下两个直接回车>
```

将公钥复制到腾讯云上`SSH密钥`,并绑定服务器实例

也可以把公钥传到服务器`~/.ssh` `id_rsa_tencent.pub`

```js
cat ~/id_rsa_tencent.pub >> ~/.ssh/authorized_keys
ssh-copy-id -i ~/.ssh/id_rsa_aliyun.pub root@101.132.142.15 -f
```

在服务器上更改权限(必须)

```js
chmod 755 ~
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**后续继续执行下面的操作**

导入公钥认证文件

```js
cat ~/.ssh/id_rsa_tencent.pub >> ~/.ssh/authorized_keys
```

添加私钥

```js
ssh-add ~/.ssh/id_rsa_tencent
```

创建 config 文件

```js
# Tencent
Host qq
Hostname 119.25.6.181
Port 22
User root
```

## 3、配置完成

终端输入

```js
ssh qq
```

就可以直接登录服务器了

退出服务器直接输入命令`logout`或者`exit`

## 4、出错

有时候每次都报

```js
Permission denied (publickey,gssapi-keyex,gssapi-with-mic,password).
```

结果要在`config`文件下 对应的配置`IdentityFile ~/.ssh/id_rsa_tencent`

[ssh 免密码登录全过程](https://developer.aliyun.com/article/709474)
