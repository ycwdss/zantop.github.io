# pm2 命令

PM2 是带有内置负载平衡器的 Node.js 应用程序的生产过程管理器。它使您可以使应用程序永远保持活动状态，无需停机即可重新加载它们，并简化常见的系统管理任务。

## 1、常用命令

- pm2 start app.js 开启进程
- pm2 list 所有进程
- pm2 stop <app_name|id|'all'|json_conf> / all 停止
- pm2 restart <app_name|id|'all'|json_conf> 重启
- pm2 delete <app_name|id|'all'|json_conf> 删除
- pm2 describe <id|app_name> 单一进程
- pm2 show <id|app_name> 单一进程
- pm2 monit 监控 cpu 和内存使用情况
- pm2 reload all 重开进程
- pm2 logs 日志信息
- pm2 flush 清理日志信息
- pm2 reloadLogs
- pm2 startup 开机自启动
- pm2 save 保存进程状态
- pm2 unstartup 取消开机自启动
- pm2 install 安装模块
- pm2 update 更新

## 2、执行 npm 命令

```js
pm2 start npm -- start
```

pm2 start npm --no-automation --name {app name} -- run {script name}

- (--no-automation)当进程崩溃时,pm2 会自动帮你重启
- (--name)启动的名称
- (--run)执行的命令
