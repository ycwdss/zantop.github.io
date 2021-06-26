# Mac 与 vim 日常命令

## Mac 日常命令

```js
ls          查看目录下的文件
ls -l       查看目录下的文件,以列表形式
ls -la      查看目录下的文件,隐藏的文件也可以查

mv a b      同目录下a 文件重命名为 b,跨目录也可以移动 mv ~/Downloads/love.txt  ~/Documents/

cp a b      复制文件跟mv一样
cp -a a b   复制保留文件所有的权限属性之类的，可以加上参数 -a
cp -r a b   复制的不是文件，而是文件夹，则要加上一个递归的参数 -r
cp -ra a b  复制文件夹，并且要保留所有的权限属性，加上参数 -ra
cp -rav a b 复制的文件夹里面有很多内容，你想看到实时进度的话，可以用 -v 参数

rm a        删除某个文件，一般 linux 会给你提示，你需要输入 yes 同意，才能删除。但是 mac 不会给提示，直接就删除掉了。
rm -f a     不想看到这个提示，而是希望直接就删除掉，可以加上一个参数 -f
rm -rf a    删除目录必须进行递归操作，所以需要加上参数 -r

touch a     创建文件
touch a b c 创建多个文件 abc
mkdir a     创建文件夹
mkdir a b c 创建多个文件夹
mkdir -p res/style/scss 新建多个层级的目录，这就需要加上参数 -p 了

less index.html 查看文本文件
pwd         pwd 看看自己在哪个目录下
cat a       查看文件的内容
```

[玩法儿](https://www.waerfa.com/)

## vim 命令

[vim 常用命令总结](https://www.cnblogs.com/yangjig/p/6014198.html)
