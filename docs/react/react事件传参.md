# react 事件传参

## bind

用 bind 绑定，调用是作为第二个参数传递，不用显示传递事件对象，定义方法时，事件对象作为最后一个参数传入

```js
<Button onClick={this.handleClick.bind(this, 'abc')}></Button>;
handleClick = (name, e) => {};
```

## 直接 this

返回一个函数，事件对象在返回的函数中

```js
<Button onClick={this.handleClick('abc')}></Button>;
handleClick = (name) => {
  console.log(e);
};
```

## 箭头

事件对象作为第二个参数传递

```js
<Button onClick={(e) => this.handleClick('abc', e)}></Button>;
handleClick = (name, e) => {};
```
