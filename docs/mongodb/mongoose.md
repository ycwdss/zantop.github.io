# mongoose

没有一个语句是明显的操作数据库，感觉都在创建类、实例化类、调用类的方法。都在操作对象，但是数据库同步被持久了。

mongoose 的哲学，就是让你用操作对象的方式操作数据库。

## 1、链接数据库

`mongoose.connect(url, options，callback);`

url:`mongodb://localhost/db1`链接到了本地数据库

options

- db -数据库设置
- server -服务器设置
- replset -副本集设置
- user -用户名
- pass -密码
- auth -鉴权选项
- mongos -连接多个数据库
- promiseLibrary

指定用户连接

```js
mongoose.connect('mongodb://用户名:密码@127.0.0.1:27017/数据库名称');
```

连接多个数据库
如果你的 app 中要连接多个数据库，只需要设置多个 url 以,隔开，同时设置 mongos 为 true

```js
mongoose.connect('urlA,urlB,...', {
  mongos: true,
});
```

## 2、Schema

schema 可以理解为 mongoose 对表结构的定义(不仅仅可以定义文档的结构和属性，还可以定义文档的实例方法、静态模型方法、复合索引等)，每个 schema 会映射到 mongodb 中的一个 collection，schema 不具备操作数据库的能力。

定义 Schema 非常简单，指定字段名和类型即可，支持的类型包括以下 8 种：

1. String 字符串
1. Number 数字
1. Date 日期
1. Buffer 二进制
1. Boolean 布尔值
1. Mixed 混合类型
1. ObjectId 对象 ID
1. Array 数组

[注意]创建 Schema 对象时，声明字段类型有两种方法，一种是首字母大写的字段类型，另一种是引号包含的小写字段类型

```js
var mySchema = new Schema({
  title: String,
  author: String,
});
//或者
var mySchema = new Schema({
  title: 'string',
  author: 'string',
});
```

```js
const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    score: Number,
    teacher: String,
  },
  {
    collection: 'student', //此需要指定collection，否则自动生成会带s
  },
);

module.exports = studentSchema;
```

如果需要在 Schema 定义后添加其他字段，可以使用 add()方法

```js
studentSchema.add({
  like: 'string',
  color: 'string',
});
```

## 3、Model

模型 Model 是根据 Schema 编译出的构造器，或者称为类，通过 Model 可以实例化出文档对象 document

文档 document 的创建和检索都需要通过模型 Model 来处理

`mongoose.model()`

`model()`

```js
//语法
mongoose.model(`文档名称`, Schema);

//实例
let student = mongoose.model('Student', studentSchema);
```

**Methods 实例方法**

Model 的实例是 document，内置实例方法有很多，如 save，可以`通过 Schema 对象的 methods 属性给实例自定义扩展方法`

看下面的例子更好理解什么是实例方法和静态方法

```js
//类
function Student() {}
//实例化一个学生
var xiaoming = new Student();
//实例方法，因为这个sleep方法的执行者是类的实例
xiaoming.sleep();

//静态方法
Student.findAllBuJiGe(); //查询所有不及格的学生
```

```js
//创建实例方法  schema 中
studentSchema.methods.sameType = function (callback) {
  this.model('Student').find({ type: this.type }, callback);
};
```

实例中查找同类，会查找到与小明同类 type 一致的所有数据。

```js
Student.zhaoren('小明', function (err, result) {
  var a = result[0];
  a.sameType(function (err, results) {
    console.log(results);
  });
});
```

**Statics 静态方法**

只要在`Schema.statics`中添加新声明的方法即可，model 的静态方法很多，如 find，update 等，可以通过 statics 属性给 Model 添加自定义扩展方法

```js
//创建静态方法 schema student.js
studentSchema.statics.zhaoren = function (name, callback) {
  this.model('Student').find({ name: name }, callback);
};
```

使用

```js
Student.zhaoren("小明",function(err,result){
            console.log(result);
});

[ {
    _id: 5a42065783f2710f904bc5d0,
    name: '小明',
    age: 12,
    score: 90,
    type: '班长',
    __v: 0

} ]
```

## 4、增

基础实例：

```js
const mongoose = require('mongoose');

//schema
let studentSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    score: Number,
    type: String,
  },
  {
    collection: 'student',
  },
);
//创建静态方法
studentSchema.statics.zhaoren = function (name, callback) {
  this.model('Student').find({ name: name }, callback);
};
//创建实例方法
studentSchema.methods.sameType = function (callback) {
  this.model('Student').find({ type: this.type }, callback);
};

let student = mongoose.model('Student', studentSchema);

//导出model
module.exports = student;
```

三种增加的方法 save(),create(),insertMany();

**save()**

```js
save([options], [options.safe], [options.validateBeforeSave], [fn]);

const newStudent = new Student({
  name: '二狗子',
  ge: 22,
  score: 78,
  type: '班长',
});
newStudent.save((err, res) => {
  console.log(res);
});
```

**create()**

使用`save()方法`，`需要先实例化为文档，再使用 save()方法保存文档`。而`create()方法`，则`直接在模型 Model 上操作`，并且可以同时新增多个文档

```js
Model.create(doc(s), [callback]);

Student.create(
  {
    name: '张二',
    age: 13,
    score: 33,
    type: '组长',
  },
  {
    name: '张三',
    age: 20,
    score: 56,
    type: '同学',
  },
  (err, doc1, doc2) => {
    console.log(doc1);
    console.log(doc2);
  },
);

//这样数据库中就添加了2条数据
```

**insertMany()**

```js
Model.insertMany(doc(s), [options], [callback]);

Student.insertMany(
  [
    {
      name: 'a1',
      age: 13,
      score: 33,
      type: '组长',
    },
    {
      name: 'b2',
      age: 20,
      score: 56,
      type: '同学',
    },
  ],
  function (err, docs) {
    console.log(docs);
  },
);
```

与 create 类型，只是同时添加多个的放在了数组中。

## 5、删

三种用于文档删除方法:remove(),findOneAndRemove(),findByIdAndRemove();

**1.remove()**

remove 有两种形式，`一种是文档的 remove()方法`，`一种是 Model 的 remove()方法`

`Model 的 remove()方法`

```js
model.remove(conditions, [callback]);

//查询条件 回调函数`function(err){}`

Student.remove({ type: '组长' }, function (err) {});

//删除了student文档中type为组长的数据
```

remove()方法中的回调函数不能省略，否则数据不会被删除。当然，可以使用`exec()方法`来简写代码

```js
Student.remove({ type: '班长' }).exec();
```

`文档的 remove()方法`

```js
document.remove([callback]);
//参数回调函数的形式如下function(err,doc){}

//先查找出来数据，在进行删除

Student.find({ type: '同学' }, function (err, doc) {
  doc.forEach(function (item, index) {
    item.remove(function (err, doc) {
      console.log(doc);
    });
  });
});
```

**2.findOneAndRemove()**

`model 的 remove()`会`删除`符合条件的`所有数据`，如果`只删除符合条件的第一条数据`，则可以使用 model 的`findOneAndRemove()`方法

```js
Model.findOneAndRemove(conditions, [options], [callback])

<!--{ "_id" : ObjectId("5a4349d292177230f8b31f2a"), "name" : "赵王", "age" : 44, "score" : 78, "type" : "同学", "__v" : 0 }
{ "_id" : ObjectId("5a4349d292177230f8b31f2b"), "name" : "小米", "age" : 32, "score" : 56, "type" : "班长", "__v" : 0 }
{ "_id" : ObjectId("5a4349d292177230f8b31f2c"), "name" : "达尔", "age" : 56, "score" : 77, "type" : "组长", "__v" : 0 }
{ "_id" : ObjectId("5a434a31448837357ce338a9"), "name" : "二蛋2", "age" : 25, "score" : 89, "type" : "组长", "__v" : 0 }
{ "_id" : ObjectId("5a434a31448837357ce338aa"), "name" : "赵王2", "age" : 11, "score" : 78, "type" : "同学", "__v" : 0 }
{ "_id" : ObjectId("5a434a31448837357ce338ab"), "name" : "小米2", "age" : 15, "score" : 56, "type" : "班长", "__v" : 0 }
{ "_id" : ObjectId("5a434a31448837357ce338ac"), "name" : "达尔2", "age" : 17, "score" : 77, "type" : "组长", "__v" : 0 }-->

//删除年龄小于20的第一位
 Student.findOneAndRemove({age:{$lt:20}},function(err,doc){
   console.log(doc);
   // { _id: 5a434a31448837357ce338aa,name: '赵王2',age: 11,score: 78,type: '同学',__v: 0 }
 })
```

与 model 的 remove()方法相同，回调函数不能省略，否则数据不会被删除。当然，可以使用 exec()方法来简写代码

```js
Student.findOneAndRemove({ age: { $lt: 20 } }).exec();
```

**3.findByIdAndRemove()**

```js
Model.findByIdAndRemove(id, [options], [callback]);

let idArr = [];
//查找所有数据，放进数组
Student.find(function (err, docs) {
  docs.forEach(function (item, index) {
    idArr.push(item._id);
  });
  //根据id删除
  Student.findByIdAndRemove(idArr[0], function (err, doc) {
    console.log(doc);
  });
});
```

类似的，该方法也不能省略回调函数，否则数据不会被删除。当然，可以使用 exec()方法来简写代码

```js
let idArr = [];
//查找所有数据，放进数组
Student.find(function (err, docs) {
  docs.forEach(function (item, index) {
    idArr.push(item._id);
  });
  //根据id删除
  Student.findByIdAndRemove(idArr[0]).exec();
});
```

## 6、查

三种方法：find(),findById(),findOne(),\$where()

数据库集合 student 中存在如下数据

```js
{ "_id" : ObjectId("5a434ec0100fd230b46b398b"), "name" : "wang", "age" : 12, "score" : 58, "__v" : 0 }
{ "_id" : ObjectId("5a434ec0100fd230b46b398c"), "name" : "li", "age" : 20, "score" : 78, "__v" : 0 }
{ "_id" : ObjectId("5a434ec0100fd230b46b398d"), "name" : "zhang", "age" : 25, "score" : 99, "__v" : 0 }
```

**1.find()**

第一个参数表示查询条件，第二个参数用于控制返回的字段，第三个参数用于配置查询参数，第四个参数是回调函数，回调函数的形式为 function(err,docs){}

```js
Model.find(conditions, [projection], [options], [callback]
```

找出所有数据

```js
Student.find(function (err, doc) {
  console.log(doc);
  //{ "_id" : ObjectId("5a434ec0100fd230b46b398b"), "name" : "wang", "age" : 12, "score" : 58, "__v" : 0 }
  //{ "_id" : ObjectId("5a434ec0100fd230b46b398c"), "name" : "li", "age" : 20, "score" : 78, "__v" : 0 }
  //{ "_id" : ObjectId("5a434ec0100fd230b46b398d"), "name" : "zhang", "age" : 25, "score" : 99, "__v" : 0 }
});
```

找出年龄大于 18 的数据

```js
Student.find({ age: { $gte: 18 } }, function (err, doc) {
  console.log(doc);

  //{ "_id" : ObjectId("5a434ec0100fd230b46b398c"), "name" : "li", "age" : 20, "score" : 78, "__v" : 0 }
  //{ "_id" : ObjectId("5a434ec0100fd230b46b398d"), "name" : "zhang", "age" : 25, "score" : 99, "__v" : 0 }
});
```

找出年龄大于 18 且名字里存在'an'的数据

```js
Student.find({ name: /an/, age: { $gte: 18 } }, function (err, doc) {
  console.log(doc);
  //{ "_id" : ObjectId("5a434ec0100fd230b46b398d"), "name" : "zhang", "age" : 25, "score" : 99, "__v" : 0 }
});
```

找出名字里存在'a'的数据，且只输出'name'字段
[注意]\_id 字段默认输出

```js
Student.find({ name: /a/ }, 'name', function (err, doc) {
  console.log(doc);
  //[ { _id: 5a434ec0100fd230b46b398b, name: 'wang' },
  //{ _id: 5a434ec0100fd230b46b398d, name: 'zhang' } ]
});
```

如果确实不需要\_id 字段输出，可以进行如下设置

```js
Student.find({ name: /a/ }, { name: 1, _id: 0 }, function (err, doc) {
  console.log(doc);
  //[ { name: 'wang' }, { name: 'zhang' } ]
});
```

找出跳过前两条数据的其他所有数据

[注意]如果使用第三个参数，前两个参数如果没有值，需要设置为 null

```js
Student.find(null, null, { skip: 2 }, function (err, doc) {
  console.log(doc);
  //{ "_id" : ObjectId("5a434ec0100fd230b46b398d"), "name" : "zhang", "age" : 25, "score" : 99, "__v" : 0 }
});
```

**2.findById()**

```js
Model.findById(id, [projection], [options], [callback]);
```

显示第 0 个元素的所有字段

```js
let idArr = [];
Student.find(function (err, docs) {
  docs.forEach(function (item, index) {
    idArr.push(item._id);
  });
  Student.findById(idArr[0], function (err, doc) {
    console.log(doc);
    //{ "_id" : ObjectId("5a434ec0100fd230b46b398b"), "name" : "wang", "age" : 12, "score" : 58, "__v" : 0 }
  });
});
```

以上代码的另一种写法如下

```js
Student.findById(idArr[0]).exec(function (err, doc) {
  console.log(doc);
});
```

只输出 name 字段

```js
Student.findById(idArr[0], { name: 1, _id: 0 }, function (err, doc) {
  console.log(doc);
  //{ name: 'wang' }
});
//或者写成下面这种形式
Student.findById(idArr[0], { name: 1, _id: 0 }).exec(function (err, doc) {
  console.log(doc);
  //{ name: 'wang' }
});
```

**3.findOne()**

该方法返回查找到的所有实例的第一个

```js
Model.findOne([conditions], [projection], [options], [callback]);
```

找出 age>20 的文档中的第一个文档

```js
Student.findOne({ age: { $gt: 20 } }, function (err, doc) {
  console.log(doc);
});
Student.findOne({ age: { $gt: 20 } }).exec(function (err, doc) {
  console.log(doc);
});
```

找出 age>20 的文档中的第一个文档，且只输出 name 字段

```js
Student.findOne({ age: { $gt: 20 } }, { name: 1, _id: 0 }, function (err, doc) {
  console.log(doc);
});
Student.findOne({ age: { $gt: 20 } }, { name: 1, _id: 0 }).exec(function (
  err,
  doc,
) {
  console.log(doc);
});
```

找出 age>20 的文档中的第一个文档，且输出包含 name 字段在内的最短字段

```js
Student.findOne({ age: { $gt: 20 } }, 'name', { lean: true }, function (
  err,
  doc,
) {
  console.log(doc);
});
Student.findOne({ age: { $gt: 20 } }, 'name')
  .lean()
  .exec(function (err, doc) {
    console.log(doc);
  });
```

文档查询中，常用的查询条件如下

```js
$or　　　　或关系
$nor　　　 或关系取反
$gt　　　　大于
$gte　　　 大于等于
$lt　　　　小于
$lte　　　 小于等于
$ne　　　　不等于
$in　　　　在多个值范围内
$nin　　　 不在多个值范围内
$all　　　 匹配数组中多个值
$regex　　 正则，用于模糊查询
$size　　　匹配数组大小
$maxDistance　范围查询，距离（基于LBS）
$mod　　　　取模运算
$near　　　 邻域查询，查询附近的位置（基于LBS）
$exists　　 字段是否存在
$elemMatch　匹配内数组内的元素
$within　　　范围查询（基于LBS）
$box　　　　 范围查询，矩形范围（基于LBS）
$center　　　范围醒询，圆形范围（基于LBS）
$centerSphere　范围查询，球形范围（基于LBS）
$slice　　　　查询字段集合中的元素（比如从第几个之后，第N到第M个元素
```

**4.\$where()**

如果要进行更复杂的查询，需要使用$where 操作符，$where 操作符功能强大而且灵活，它可以使用任意的 JavaScript 作为查询的一部分，包含 JavaScript 表达式的字符串或者 JavaScript 函数

查找年龄为 20 的

```js
Student.find({ $where: 'this.age == 20' }, function (err, docs) {
  console.log(docs);
});
```

使用函数,查找年龄不为 20 的

```js
Student.find(
  {
    $where: function () {
      return 'this.age !== 20';
    },
  },
  function (err, docs) {
    console.log(docs);
  },
);
```

## 7、改

文档更新可以使用以下几种方法：

```js
update();
updateMany();
find() + save();
updateOne();
findOne() + save();
findByIdAndUpdate();
fingOneAndUpdate();
```

**1.update()**
第一个参数 conditions 为查询条件，第二个参数 doc 为需要修改的数据，第三个参数 options 为控制选项，第四个参数是回调函数

```
Model.update(conditions, doc, [options], [callback])
```

options 有如下选项:

```js
    safe (boolean)： 默认为true。安全模式。
　　upsert (boolean)： 默认为false。如果不存在则创建新记录。
　　multi (boolean)： 默认为false。是否更新多个查询记录。
　　runValidators： 如果值为true，执行Validation验证。
　　setDefaultsOnInsert： 如果upsert选项为true，在新建时插入文档定义的默认值。
　　strict (boolean)： 以strict模式进行更新。
　　overwrite (boolean)： 默认为false。禁用update-only模式，允许覆盖记录。
```

数据库中 student 中有以下数据：

```js
{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋", "age" : 25, "score" : 89, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c610"), "name" : "李米", "age" : 15, "score" : 56, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c60f"), "name" : "赵王", "age" : 11, "score" : 78, "__v" : 0 }
```

现在使用 update()方法查询 age 大于 20 的数据，并将其年龄更改为 40 岁

```js
Student.update({ age: { $gte: 20 } }, { age: 40 }, function (err, res) {
  //{ n: 1, nModified: 1, ok: 1 }
  console.log(res);
});
```

经过以上操作，数据库结果如下。只有第一个数据更改为 40 岁。而第三个数据没有发生变化

```js
{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋", "age" : 40, "score" : 89, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c610"), "name" : "李米", "age" : 15, "score" : 56, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c60f"), "name" : "赵王", "age" : 11, "score" : 78, "__v" : 0 }
```

如果要`同时更新多个记录`，需要设`置 options 里的 multi 为 true`。下面将名字中有'a'字符的年龄设置为 10 岁

```js
Student.update({ name: /王/ }, { age: 10 }, { multi: true }, function (
  err,
  raw,
) {
  //{ n: 2, nModified: 2, ok: 1 }
  console.log(raw);
});
```

经过上面的 update，现在的数据为：

```js
{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋", "age" : 10, "score" : 89, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c610"), "name" : "李米", "age" : 15, "score" : 56, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c60f"), "name" : "赵王", "age" : 10, "score" : 78, "__v" : 0 }
```

如果设置的查找条件，数据库里的数据并不满足，默认什么事都不发生

```js
Student.update({ age: 100 }, { name: 'hundred' }, function (err, raw) {
  //{ n: 0, nModified: 0, ok: 1 }
  console.log(raw);
});
```

如果设置`options`里的`upsert 参数为 true`，若`没有符合查询条件的文档`，mongo 将会综合第一第二个参数向集合`插入一个新的文档`

```js
Student.update({ age: 100 }, { name: '大兵' }, { upsert: true }, function (
  err,
  raw,
) {
  //{ n: 1, nModified: 0,upserted: [ { index: 0, _id: 5972c202d46b621fca7fc8c7 } ], ok: 1 }
  console.log(raw);
});
```

查找不到 age=100 的，综合第一二个参数，会向数据库中插入一条新的数据。

```js
{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋", "age" : 10, "score" : 89, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c610"), "name" : "李米", "age" : 15, "score" : 56, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c60f"), "name" : "赵王", "age" : 10, "score" : 78, "__v" : 0 }
{ "_id" : ObjectId("5a43617c0228b2457ab75d82"), "age" : 100, "name" : "大兵", "__v" : 0 }
```

`[注意]`

update()方法中的回调函数不能省略，否则数据不会被更新。如果回调函数里并没有什么有用的信息，则可以使用`exec()`简化代码

```js
temp.update({ name: /aa/ }, { age: 0 }, { upsert: true }).exec();
```

**2.updateMany()**

updateMany()与 update()方法唯一的区别就是默认`更新多个文档`，即使设置`{multi:false}`也无法只更新第一个文档

```js
Model.updateMany(conditions, doc, [options], [callback]);
```

将数据库中名字中带有'王'的数据，年龄变为 50 岁

```js
Student.updateMany({ name: /王/ }, { age: 50 }, function (err, raw) {
  //{ n: 2, nModified: 2, ok: 1 }
  console.log(raw);
});
```

更新后的数据：

```js
{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋", "age" : 50, "score" : 89, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c610"), "name" : "李米", "age" : 15, "score" : 56, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c60f"), "name" : "赵王", "age" : 50, "score" : 78, "__v" : 0 }
{ "_id" : ObjectId("5a43617c0228b2457ab75d82"), "age" : 100, "name" : "大兵", "__v" : 0 }
```

**3.find() + save()**

如果需要更新的操作比较复杂，可以使用 find()+save()方法来处理，比如找到年龄大于 50 岁的数据，名字后面添加'50'字符

```js
Student.find({ age: { $gte: 50 } }, function (err, docs) {
  console.log(docs);
  docs.forEach(function (item, index) {
    item.name += '50';
    item.save();
  });
  console.log(docs);
});
```

数据如果下：

```js
{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋50", "age" : 50, "score" : 89, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c610"), "name" : "李米", "age" : 15, "score" : 56, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c60f"), "name" : "赵王50", "age" : 50, "score" : 78, "__v" : 0 }
{ "_id" : ObjectId("5a43617c0228b2457ab75d82"), "age" : 100, "name" : "大兵50", "__v" : 0 }
```

**4.updateOne()**

updateOne()方法`只能更新找到的第一条数据`，即使设置{multi:true}也无法同时更新多个文档

将数据库中名字中带有'50'的数据，年龄变为 60 岁

```js
Student.updateOne({ name: /50/ }, { age: 60 }, function (err, raw) {
  //{ n: 1, nModified: 1, ok: 1 }
  console.log(raw);
});
```

可以看到下面只有第一条数据的 age 更改为了 60

```js
{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋50", "age" : 60, "score" : 89, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c610"), "name" : "李米", "age" : 15, "score" : 56, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c60f"), "name" : "赵王50", "age" : 50, "score" : 78, "__v" : 0 }
{ "_id" : ObjectId("5a43617c0228b2457ab75d82"), "age" : 100, "name" : "大兵50", "__v" : 0 }
```

**5.findOne() + save()**

如果需要更新的操作比较复杂，可以使用 findOne()+save()方法来处理，比如找到名字为'王蛋 50'的数据，年龄加 100 岁

```js
Student.findOne({ name: '王蛋50' }, function (err, doc) {
  //{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋50", "age" : 60, "score" : 89, "__v" : 0 }
  console.log(doc);
  doc.age += 100;
  doc.save();
  //{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "王蛋50", "age" : 160, "score" : 89, "__v" : 0 }
  console.log(doc);
});
```

**6.findOneAndUpdate()**

fineOneAndUpdate()方法的第四个参数回调函数的形式如下 function(err,doc){}

```js
Model.findOneAndUpdate([conditions], [update], [options], [callback]);
```

**7.findByIdAndUpdate()**

找到一条数据并更新

fineByIdAndUpdate()方法的第四个参数回调函数的形式如下 function(err,doc){}

```js
Model.findOneAndUpdate([conditions], [update], [options], [callback]);
```

```js
Student.findOneAndUpdate({ name: '王蛋50' }, { name: '大枣' }, function (
  err,
  doc,
) {
  console.log(doc);
});
```

更新后的数据为：

```js
{ "_id" : ObjectId("5a435fdc4cb507105c93c60e"), "name" : "大枣", "age" : 160, "score" : 89, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c610"), "name" : "李米", "age" : 15, "score" : 56, "__v" : 0 }
{ "_id" : ObjectId("5a435fdc4cb507105c93c60f"), "name" : "赵王50", "age" : 50, "score" : 78, "__v" : 0 }
{ "_id" : ObjectId("5a43617c0228b2457ab75d82"), "age" : 100, "name" : "大兵50", "__v" : 0 }
```

**8.findByIdAndUpdate()**

根据 id 更新数据

fineByIdAndUpdate()方法的第四个参数回调函数的形式如下 function(err,doc){}

## 9、前后钩子

前后钩子即 pre()和 post()方法，又称为中间件，是在执行某些操作时可以执行的函数。中间件在 schema 上指定，类似于静态方法或实例方法等

可以在数据库执行下列操作时，设置前后钩子：

```js
init;
validate;
save;
remove;
count;
find;
findOne;
findOneAndRemove;
findOneAndUpdate;
insertMany;
update;
```

## 10、Date

设置默认时间：

```js
  expire: {
         type: Date,
          default: () => Date.now() + 1000 * 60 * 60 * 24 * 7
       }
```

[Mongoose date field - Set default to date.now + N days](https://stackoverflow.com/questions/29899208/mongoose-date-field-set-default-to-date-now-n-days)

[参考：Mongoose 基础入门](https://www.cnblogs.com/xiaohuochai/p/7215067.html?utm_source=itdadao&utm_medium=referral#top)

[Mongoose 全面理解](https://www.cnblogs.com/samsimi/p/6547568.html)

[Mongoose 参考手册](http://cnodejs.org/topic/548e54d157fd3ae46b233502)
