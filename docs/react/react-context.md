# react-Context

Context API 主要解决 props 向对层嵌套的子组件传递的问题(爷孙组件 props 传递)，原理是定义一个全局对象，通过订阅发布的方式进行数据的传递。

## 1、React.crateContext

Context Api 使用 React.crateContext 方法构建，并且定义一个默认值。

```js
const { Provider, Consumer } = React.createContext('default');
```

返回的对象中有两个组件。这两个组件组合成订阅发布模式

- Provider 提供者(发布者)
- Consumer 消费者(订阅者)

在爷孙组件传值的场景中，爷爷组件负责数据的提供，孙子组件负责数据的消费。

## 2、Provider 组件

Provide 是提供者，在爷孙组件中，provide 就相当于爷爷组件向孙子组件提供数据的组件。

所有需要传递的数据放在 Provider 中，所有的在子组件都可以接受的到。形成子孙节点传递的扁平化。

```js
//parent
<Provider value={/* 某个值 */}>{this.props.children}</Provider>
```

注意：value 不是传值中的属性，而是必须要这样写。

## 3、使用 Consumer

Consumer 是消费者，也就是说，在爷孙组件中，爷爷组件提供资源，孙子组件来消费。

Consumer 同样也是一个组件。接受到的是爷爷组件中 Provider 组件发送过来的值。

```js
const Child = (props, context) => {
  return (
    <Consumer>
      {(value) => <p>子节点=》newContext :{value.newContext}</p>}
    </Consumer>
  );
};
```

由于 Provider 组件中所传递的对象是 this.props.children,所以必须这样写：

```js
export default class Context extends React.Component {
  render() {
    return (
      <Parent>
        <Child />
      </Parent>
    );
  }
}
```

Context API 提供了一套订阅发布者机制，这套机制出现，在爷孙组件传值上方便了很多。同时，我认为这个机制的出现，可以尝试取代 react-redux 的 Provider。

示例：

```js
import React, { useState, useEffect } from 'react';

const themes = {
  light: {
    color: '#fff',
    background: 'gray',
  },
  dark: {
    color: 'green',
    background: 'orange',
  },
};
//创建Context组件
const ThemeContext = React.createContext({
  theme: 'dark',
  toggle: () => {}, //向上下文设定一个回调方法
});

//顶层组件
class About extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = () => {
      //设定toggle方法，会作为context参数传递
      this.setState((state) => ({
        theme: state.theme === themes.dark ? themes.light : themes.dark,
      }));
    };

    this.state = {
      theme: themes.light,
      toggle: this.toggle,
    };
  }

  render() {
    return (
      <ThemeContext.Provider value={this.state}>
        <Content />
      </ThemeContext.Provider>
    );
  }
}

//中间组件
function Content() {
  return (
    <ThemeContext.Consumer>
      {({ theme, toggle }) => (
        <div>
          {JSON.stringify(theme)}
          <Button />
        </div>
      )}
    </ThemeContext.Consumer>
  );
}

//接收组件
function Button() {
  return (
    <ThemeContext.Consumer>
      {({ theme, toggle }) => (
        <button
          onClick={toggle} //调用回调
          style={theme}
        >
          Toggle Theme
        </button>
      )}
    </ThemeContext.Consumer>
  );
}

export default About;
```

[React 中文： Context(上下文)](https://zh-hans.reactjs.org/docs/context.html)  
[简书：React Context(上下文)](https://www.jianshu.com/p/65b348bf86ad)
