# Object.defineProperty

## 1、语法

```js
Object.defineProperty(obj, prop, descriptor);
```

## 2、参数

obj:目标对象

prop:需要定义的属性或方法的名字。

descriptor:目标属性所拥有的特性。

## 3、可供定义的特性列表

1. value:属性的值
1. writable:如果为 false，属性的值就不能被重写。
1. configurable:如果为 false，则任何尝试删除目标属性或修改属性以下特性（writable, configurable, enumerable）的行为将被无效化。
1. enumerable:是否能在 for...in 循环中遍历出来或在 Object.keys 中列举出来。
1. get: 一旦目标属性被访问就会调回此方法，并将此方法的运算结果返回用户。
1. set:一旦目标属性被赋值，就会调回此方法。

## 4、示例

```js
  //定义个对象
  let obj={};
  let initVal='';
  //对obj对象属性name的监听
  Object.defineProperty(obj,'name'{
    value:1，         //设置属性的值
    configurable:true,//属性name是否可删除
    writable:true,    //属性值是都可以重写
    enumerable:true,  //是否允许遍历,可以枚举

    //**注意**：当使用了getter或者setter方法, 不允许使用writable和value这两个属性
    get(){
    //取obj的name属性会触发
      return initVal;
    },
    set(){
    //给obj赋值会触发get方法
      initVlue = value
    }
 })

 delete obj.name；//configurable:true 可以删除
 obj.name=2;     // writable:true 属性name值被重写
 console.log(obj)
```
