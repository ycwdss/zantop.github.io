# nodejs 爬虫彩票数据

## 1、工具

- [flyio](https://wendux.github.io/dist/#/doc/flyio/readme) 请求库
- [cheerio](https://cheerio.js.org/) jquery 核心功能的一个快速灵活而又简洁的实现，主要是为了用在服务器端需要对 DOM 进行操作的地方
- [iconv-lite](https://github.com/ashtuchkin/iconv-lite) 转换字符编码

## 2、操作

从彩票 500 网站上获取数据

```js
http://kaijiang.500.com/shtml/dlt/19077.shtml
```

可以看到只需要把彩种和对应期数处理下，就访问了对应的页面。

```js
fly
  .get(
    `http://kaijiang.500.com/shtml/${lotteryType}/${lotteryDate}.shtml`,
    null,
    {
      responseType: 'stream',
    },
  )
  .then((res) => {
    const html = iconv.decode(res.data, 'gb2312');
    let $ = cheerio.load(html);
    resolve($);
  })
  .catch((err) => {
    reject(err);
  });
```

注意返回的类型要流的形式，先通过转 gb2312 编码解析，cheerio 在 load 后就获得一个文档结果，通过`$`可以去操作页面中的`DOM`了

[cheerio 中文文档](https://www.jianshu.com/p/629a81b4e013)

把需要的数据获取后，存入数据库。

然后 egg.js 的定时任务 [`schedule`](https://github.com/eggjs/egg/blob/master/docs/source/zh-cn/basics/schedule.md)，在开奖时间后，每隔几分钟跑一次，获取最新的开奖数据。
