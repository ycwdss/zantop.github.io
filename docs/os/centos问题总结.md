# centos 问题总结

## 1、npm install

Centos7，尝试使用 sudo 等管理员权限无效,工程执行 npm install，遇到的问题：

```js
Error: EACCES: permission denied, open '/home/eggLottery/appveyor.yml'
```

官网解释：
If npm was invoked with root privileges, then it will change the uid to the user account or uid specified by the user config, which defaults to nobody. Set the unsafe-perm flag to run scripts with root privileges.

处理方案：
在命令结尾加 --unsafe-perm： npm install --unsafe-perm  
或者在 package.json 中添加：

```js
"config": {
    "unsafe-perm":true
}
```

或者执行

```js
npm install --unsafe-perm=true --allow-root
```
