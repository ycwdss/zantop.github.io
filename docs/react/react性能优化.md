# react 性能优化

## 1、事件的 this 绑定

1. 在执行 bind this

```js
//会在每次点击时通过bind创建一个新的方法，浪费性能
<button onClick={this.handleAdd.bind(this)}>点击</button>
```

2. 使用箭头函数

```js
<button onClick={() => this.handleAdd()}>点击</button>
```

3. 在 constructor 绑定 this

```js
//construnctor 在组件中只有初始的时候，执行一次，那this的绑定也就绑定一次
 constructor(props){
        super(props)
        this.handleAdd=this.handleAdd.bind(this)
    }

 <button onClick={this.handleAdd}>点击</button>
```

## 定制 shouldComponentUpdate

只要父组件更新，不管是否传入子组件的 props 更新，子组件都会重新渲染，浪费性能。

那么可以在子组件中判断是否传入的 props 改变了，如果没有改变的话，就不重新渲染了，这就要在`shouldComponentUpdate`来判断。

```js
//父组件
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "测试demo"
    };
    this.handleDemo = this.handleDemo.bind(this);
  }
  handleDemo() {
    this.setState((prevState, props) => ({
      title: prevState.title + "9"
    }));
  }
  render() {
    return (
      <div>
        <button onClick={this.handleDemo}>按钮</button>
        <Demo title={this.state.title} />
      </div>
    );
  }
}
//子组件
class Demo extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  //判断是否接受更新的props
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }
  //是否更新
  shouldComponentUpdate(nextProps, nextState) {
    console.log(nextProps, nextState);
    if (nextProps.title === this.props.title) {
      //如果更新的nextProps没有变化，就不会再重新渲染了
      return false;
    }
    return true;
  }
  render() {
    console.log("demo渲染了");
    return <h1>{this.props.title}</h1>;
  }
}
export default Test;
```

## 3.PureComponent()

react 也提供了更便捷的`pureComponent`

```js
import React, { Component, PureComponent } from "react";
//父组件
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "测试demo"
    };
    this.handleDemo = this.handleDemo.bind(this);
  }
  handleDemo() {
    this.setState((prevState, props) => ({
      title: prevState.title + "9"
    }));
  }
  render() {
    return (
      <div>
        <button onClick={this.handleDemo}>按钮</button>
        <Demo title={this.state.title} />
      </div>
    );
  }
}
//子组件
class Demo extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    //只有props更新了，才会重新渲染
    console.log("demo渲染了");
    return <h1>{this.props.title}</h1>;
  }
}
export default Test;
```
