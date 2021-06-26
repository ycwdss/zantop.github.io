# redux 的应用

## 1、设计思想

react 本质上是一个 JavaScript 的库，是创建 UI 接口的视图层框架.
![](https://user-images.githubusercontent.com/26807227/48754075-6150c680-eccb-11e8-83ba-f3463b08e952.png)

**左图**：无 redux 的数据状态传递，子组件要传递到父组件，然后才能传递到其他的兄弟组件。  
**右图**：结合一个数据层框架 redux,就可以轻松的把数据传递到各个组件。

redux 要求我们把数据都放在`store 公共存储空间`，当组件想要去传递数据时，只需要改变 store 里边对应的数据，想要接收数据的组件会自动感知到 store 有变化，就会重新去 store 取数据，从而这个组件就能得到新的数据。  
这样的操作流程对于深层次的组件是非常适用的，组件与组件之间的数据传递会变得非常简单。
组件改变，修改数据，其他组件再来取值。这就是 Redux 的基础设计理念。

## 2、Redux 的工作流程

redux 的工作流：  
![](https://images2015.cnblogs.com/blog/958489/201703/958489-20170310145551811-446170034.png)  
可以举个实际的例子:  
`React Components` 是借书的用户  
`Action Creactor`是借书时说的话(借什么书)  
`Store`是图书馆管理员  
`Reducer`是记录本(借什么书，还什么书，在哪儿，需要查一下)  
`state` 是书籍信息

整个流程就是借书的用户(`React Components`)需要先存在，然后需要借书，需要一句话来描述借什么书(`Action Creactor`)，图书馆管理员(`Store`)听到后需要查一下记录本(`Reducer`)，了解图书的位置，最后图书馆管理员会把这本书(`state`)给到这个借书人

转换为代码是, React Components 需要获取一些数据, 然后它就告知 Store 需要获取数据，这就是就是 Action Creactor , Store 接收到之后去 Reducer 查一下, Reducer 会告诉 Store 应该给这个组件什么数据

## 3、API 流程

用户`dispatch`-->`action`-->`reducer`--->`store`

### **3.1、 Store**

Store 就是保存数据的地方，你可以把它看成一个容器。整个应用只能有一个 Store。

Redux 提供 createStore 这个函数，接收 reducer 和中间件 用来生成 Store。

```js
import { createStore } from 'redux';
const store = createStore(fn);
```

上面代码中，createStore 函数接受另一个函数作为参数，返回新生成的 Store 对象。

### **3.2、 State**

Store 对象包含所有数据。如果想得到某个时点的数据，就要对 Store 生成快照。这种时点的数据集合，就叫做 State。

当前时刻的 State，可以通过 store.getState()拿到。

```js
import { createStore } from 'redux';
const store = createStore(fn);

const state = store.getState();
```

Redux 规定， 一个 State 对应一个 View。只要 State 相同，View 就相同。你知道 State，就知道 View 是什么样，反之亦然。

### **3.3、 Action**

State 的变化，会导致 View 的变化。但是，用户接触不到 State，只能接触到 View。所以，State 的变化必须是 View 导致的。Action 就是 View 发出的通知，表示 State 应该要发生变化了。

Action 是一个对象。其中的 type 属性是必须的，表示 Action 的名称。其他属性可以自由设置，社区有一个规范可以参考。

```js
const action = {
  type: 'ADD_TODO',
  payload: 'Learn Redux',
};
```

上面代码中，Action 的名称是 ADD_TODO，它携带的信息是字符串 Learn Redux。

可以这样理解，Action 描述当前发生的事情。改变 State 的唯一办法，就是使用 Action。它会运送数据到 Store。

### **3.4、 Action Creator**

View 要发送多少种消息，就会有多少种 Action。如果都手写，会很麻烦。可以定义一个函数来生成 Action，这个函数就叫 Action Creator。

```js
const ADD_TODO = '添加 TODO';

function addTodo(text) {
  return {
    type: ADD_TODO,
    text,
  };
}

const action = addTodo('Learn Redux');
```

上面代码中，addTodo 函数就是一个 Action Creator。

### **3.5、 store.dispatch()**

store.dispatch()是 View 发出 Action 的唯一方法。

```js
import { createStore } from 'redux';
const store = createStore(fn);

store.dispatch({
  type: 'ADD_TODO',
  payload: 'Learn Redux',
});
```

上面代码中，store.dispatch 接受一个 Action 对象作为参数，将它发送出去。

结合 Action Creator，这段代码可以改写如下。

```js
store.dispatch(addTodo('Learn Redux'));
```

### **3.6、 Reducer**

Store 收到 Action 以后，必须给出一个新的 State，这样 View 才会发生变化。这种 State 的计算过程就叫做 Reducer。

Reducer 是一个函数，它接受 Action 和当前 State 作为参数，返回一个新的 State。下面是一个实际的例子

```js
const defaultState = 0;
const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'ADD':
      return state + action.payload;
    default:
      return state;
  }
};

const state = reducer(0, {
  type: 'ADD',
  payload: 2,
});
```

上面代码中，reducer 函数收到名为 ADD 的 Action 以后，就返回一个新的 State，作为加法的计算结果。其他运算的逻辑（比如减法），也可以根据 Action 的不同来实现。

实际应用中，Reducer 函数不用像上面这样手动调用，store.dispatch 方法会触发 Reducer 的自动执行。为此，Store 需要知道 Reducer 函数，做法就是在生成 Store 的时候，将 Reducer 传入 createStore 方法。

```js
import { createStore } from 'redux';
const store = createStore(reducer);
```

上面代码中，createStore 接受 Reducer 作为参数，生成一个新的 Store。以后每当 store.dispatch 发送过来一个新的 Action，就会自动调用 Reducer，得到新的 State。

### **3.7、 store.subscribe()**

Store 允许使用 store.subscribe 方法设置监听函数，一旦 State 发生变化，就自动执行这个函数。

```js
import { createStore } from 'redux';
const store = createStore(reducer);

store.subscribe(listener);
```

显然，只要把 View 的更新函数（对于 React 项目，就是组件的 render 方法或 setState 方法）放入 listen，就会实现 View 的自动渲染。

store.subscribe 方法返回一个函数，调用这个函数就可以解除监听。

```js
let unsubscribe = store.subscribe(() => console.log(store.getState()));

unsubscribe();
```

## 4、react-redux

把 store 直接集成到 React 应用的顶层 props 里面，只要各个子组件能访问到顶层 props 就行了

```js
<顶层组件 store={store}>
  <App />
</顶层组件>
```

不就 ok 了吗？这就是 react-redux。Redux 官方提供的 React 绑定库。 具有高效且灵活的特性。

### 4.1、Provider

这个顶级组件就是 Provider,一般我们都将顶层组件包裹在 Provider 组件之中，这样的话，所有组件就都可以在 react-redux 的控制之下了,但是 store 必须作为参数放到 Provider 组件中去

```js
<Provider store = {store}>
    <App />
<Provider>
//这个组件的目的是让所有组件都能够访问到Redux中的数据。
```

### 4.2、connect

Provider 组件连接了 store , Provider 内部的组件有能力获取到 store ,是怎样获取的呢？就是通过 connect 这个方法获取到里面的数据的。  
connect 就是将 redux 中的 state 和 dispatch 映射到组件的 props 中。

```js
connect(mapStateToProps, mapDispatchToProps)(MyComponent);
//接收三个参数，前面两个是连接的规则，最后一个参数是连接的组件
```

#### **mapStateToProps**

把 state 映射到 props 中去 ,其实也就是把 Redux 中的数据映射到 React 中的 props 中去。

```js
import React, { Component } from 'react';
import { connect } from 'react-redux';

class TodoList extends Component {
  render() {
    return (
      <div>
        <input value={this.props.inputValue} />
        <button>提交</button>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    inputValue: state.inputValue,
  };
};
export default connect(mapStateToProps, null)(TodoList);
```

#### **mapDispatchToProps**

如果需要对 store 的数据做修改，dispatch 是指的 store.dispatch ,可以通过 mapDispatchToProps 方法把 store.dispatch 挂载到 props 上，为什么呢？

因为想要改变 store 里的内容，就要调用 dispatch 方法, dispatch 方法被映射到了 props 上，所以就可以通过 this.props.dispatch 方法去调用了

```js
import React, { Component } from 'react';
import { connect } from 'react-redux';
class TodoList extends Component {
  render() {
    return (
      <div>
        <input
          value={this.props.inputValue}
          onChange={this.props.handleInputChange}
        />
        <button>提交</button>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    inputValue: state.inputValue,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    handleInputChange(e) {
      const action = {
        type: 'change_input_value',
        value: e.target.value,
      };
      dispatch(action);
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TodoList);
```

## 5、中间件

如果按照原始的 redux 工作流程，当组件中产生一个 action 后会直接触发 reducer 修改 state，reducer 又是一个纯函数，也就是不能再 reducer 中进行异步操作；  
而往往实际中，组件中发生的 action 后，在进入 reducer 之前需要完成一个异步任务,比如发送 ajax 请求后拿到数据后，再进入 reducer,显然原生的 redux 是不支持这种操作的,这个时候急需一个中间件来处理这种业务场景.

**Redux 中间件机制**

没有中间件的 redux 数据流：
![](http://open.zantop.cn/redux-thunk01.png)
有中间件的 redux 数据流：
![](http://open.zantop.cn/redux-thunk02.png)

增加了 middleware 后,途中对 action 进行截获进行一些操作（异步数据请求，日志记录等），之后在派发 action 到 reducer.

**理解中间价的机制**

由于 redux 提供了 applyMiddleware 方法来加载 middleware，因此我们首先可以看一下 redux 中关于 applyMiddleware 的源码：

```js
export default function applyMiddleware(...middlewares) {
  //return一个函数，它可以接受createStore方法作为参数，返回全新的store和dispatch
  return (createStore) => (...args) => {
    // 利用传入的createStore和reducer和创建一个store
    const store = createStore(...args);
    let dispatch = () => {
      throw new Error();
    };
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args),
    };
    // 让每个 middleware 带着 middlewareAPI 这个参数分别执行一遍
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));
    // 接着 compose 将 chain 中的所有匿名函数，组装成一个新的函数，即新的 dispatch
    dispatch = compose(...chain)(store.dispatch);
    // 返回经 middlewares 增强后的 createStore
    return {
      ...store,
      dispatch,
    };
  };
}
```

redux 提供了 compose 方式

```js
export default function compose(...funcs) {
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => b(a), dispatch);
}
```

看一个什么也不做的中间件

```js
const doNothingMidddleware = (dispatch, getState) => (next) => (action) =>
  next(action);
```

[完全理解 redux（从零实现一个 redux） ](https://github.com/brickspert/blog/issues/22)  
[实现一个 redux](https://gitee.com/ycwdss/redux-code)  
[Redux 和 React-Redux 的实现（一）：Redux 的实现和 context](https://www.cnblogs.com/isLiu/p/8117427.html)  
[大白话解析 Redux 、 redux-thunk 、redux-saga 和 react-redux](https://github.com/lulujianglab/blog/issues/34)  
[深入 Redux 架构](http://www.cnblogs.com/MuYunyun/p/6530715.html)

[详解 redux 中间件](https://zhuanlan.zhihu.com/p/200775480)
