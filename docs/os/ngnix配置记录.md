# ngnix 配置记录

## 1、ngnix.conf

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

## 2、配置 https

conf.d 文件夹下 eggjs.conf

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
     ## 配置后端接口
     location /lottery {
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header Host $http_host;
           proxy_set_header X-Nginx-Proxy true;
           proxy_set_header Connection "";
           proxy_set_header Cookie $http_cookie;
           proxy_pass http://172.17.0.11:7002;
    }
  }
```

## 3、问题

**1. 在 centos 下启动 nginx 出现 Failed to start nginx.service:unit not found**

错误的原因就是没有添加 nginx 服务，所以启动失败。

- 在/root/etc/init.d/目录下新建文件，文件名为 nginx
- 或者用命令在根目录下执行:# vim /etc/init.d/nginx (注意 vim 旁边有一个空格)

插入一下代码：

```js
#!/bin/sh
# nginx - this script starts and stops the nginx daemin
#
# chkconfig:   - 85 15

# description:  Nginx is an HTTP(S) server, HTTP(S) reverse \
#               proxy and IMAP/POP3 proxy server

# processname: nginx
# config:      /usr/local/nginx/conf/nginx.conf
# pidfile:     /usr/local/nginx/logs/nginx.pid

# Source function library.

. /etc/rc.d/init.d/functions

# Source networking configuration.

. /etc/sysconfig/network

# Check that networking is up.

[ "$NETWORKING" = "no" ] && exit 0

nginx="/usr/local/nginx/sbin/nginx"

prog=$(basename $nginx)

NGINX_CONF_FILE="/usr/local/nginx/conf/nginx.conf"

lockfile=/var/lock/subsys/nginx

start() {

    [ -x $nginx ] || exit 5

    [ -f $NGINX_CONF_FILE ] || exit 6

    echo -n $"Starting $prog: "

    daemon $nginx -c $NGINX_CONF_FILE

    retval=$?

    echo

    [ $retval -eq 0 ] && touch $lockfile

    return $retval

}


stop() {

    echo -n $"Stopping $prog: "

    killproc $prog -QUIT

    retval=$?

    echo

    [ $retval -eq 0 ] && rm -f $lockfile

    return $retval

}



restart() {

    configtest || return $?

    stop

    start

}


reload() {

    configtest || return $?

    echo -n $"Reloading $prog: "

    killproc $nginx -HUP

    RETVAL=$?

    echo

}

force_reload() {

    restart

}


configtest() {

  $nginx -t -c $NGINX_CONF_FILE

}



rh_status() {

    status $prog

}


rh_status_q() {

    rh_status >/dev/null 2>&1

}

case "$1" in

    start)

        rh_status_q && exit 0
        $1
        ;;

    stop)


        rh_status_q || exit 0
        $1
        ;;

    restart|configtest)
        $1
        ;;

    reload)
        rh_status_q || exit 7
        $1
        ;;


    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;


    condrestart|try-restart)

        rh_status_q || exit 0
            ;;

    *)

        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}"
        exit 2

esac
```

执行命令

1. `chmod 755 /etc/init.d/nginx`

2. `chkconfig --add nginx`

开启 ngnix

`service nginx start`
