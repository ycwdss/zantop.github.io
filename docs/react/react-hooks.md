# react-hooks

## 1、什么是hooks

- React 一直都提倡使用函数组件，但是有时候需要使用 state 或者其他一些功能时，只能使用类组件，因为函数组件没有实例，没有生命周期函数，只有类组件才有
- Hooks 是 React 16.8 新增的特性，它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性
- 如果你在编写函数组件并意识到需要向其添加一些 state，以前的做法是必须将其它转化为 class。现在你可以直接在现有的函数组件中使用 Hooks
- 凡是 use 开头的 React API  都是 Hooks

## 2、hooks 解决的问题

### 类组件的不足

- **状态逻辑难复用**： 在组件之间复用状态逻辑很难，可能要用到 **render props （渲染属性**）或者 **HOC（高阶组件**），但无论是渲染属性，还是高阶组件，都会在原先的组件外包裹一层父容器（一般都是 div 元素），**导致层级冗余**
- **趋向复杂难以维护**：

  - 在生命周期函数中混杂不相干的逻辑（如：在 componentDidMount 中注册事件以及其他的逻辑，在 componentWillUnmount 中卸载事件，这样分散不集中的写法，很容易写出 bug ）
  - 类组件中到处都是对状态的访问和处理，导致组件难以拆分成更小的组件


- **this 指向问题**：父组件给子组件传递函数时，必须绑定 this

react 中的组件四种绑定 this 方法的区别
```js
class App extends React.Component<any, any> {
    handleClick2;
    constructor(props) {
        super(props);
        this.state = {
            num: 1,
            title: ' react study'
        };
        this.handleClick2 = this.handleClick1.bind(this);
    }
    handleClick1() {
        this.setState({
            num: this.state.num + 1,
        })
    }
    handleClick3 = () => {
        this.setState({
            num: this.state.num + 1,
        })
    };
    render() {
        return (<div>
            <h2>Ann, {this.state.num}</h2>
            <button onClick={this.handleClick2}>btn1</button>
            <button onClick={this.handleClick1.bind(this)}>btn2</button>
            <button onClick={() => this.handleClick1()}>btn3</button>
            <button onClick={this.handleClick3}>btn4</button>
        </div>)
    }
}
```
前提：子组件内部做了性能优化，如（**React.PureComponent**）


- 第一种是在构造函数中绑定 this：那么每次父组件刷新的时候，如果传递给子组件其他的 props 值不变，那么子组件就不会刷新；
- 第二种是在 render() 函数里面绑定 this：因为 bind 函数会返回一个新的函数，所以每次父组件刷新时，都会重新生成一个函数，即使父组件传递给子组件其他的 props 值不变，子组件每次都会刷新；
- 第三种是使用箭头函数：父组件刷新的时候，即使两个箭头函数的函数体是一样的，都会生成一个新的箭头函数，所以子组件每次都会刷新；
- 第四种是使用类的静态属性：原理和第一种方法差不多，比第一种更简洁

综上所述，如果不注意的话，很容易写成第三种写法，导致性能上有所损耗。


###  hooks 优势

- 能优化类组件的三大问题
- 能在无需修改组件结构的情况下复用状态逻辑（自定义 Hooks ）
- 能将组件中相互关联的部分拆分成更小的函数（比如设置订阅或请求数据）
- 副作用的关注点分离：副作用指那些没有发生在数据向视图转换过程中的逻辑，如 ajax 请求、访问原生dom 元素、本地持久化缓存、绑定/解绑事件、添加订阅、设置定时器、记录日志等。以往这些副作用都是写在类组件生命周期函数中的。而 useEffect 在全部渲染完毕后才会执行，useLayoutEffect 会在浏览器 layout 之后，painting 之前执行。
  
[**注意事项**](https://reactjs.org/warnings/invalid-hook-call-warning.html)

只能在函数内部的最外层调用 Hook，不要在循环、条件判断或者子函数中调用  
只能在 React 的函数组件中调用 Hook，不要在其他 JavaScript 函数中调用




## 3、内置的 hooks

React 一共内置了 9 种 Hook：

1. useState
2. usEffect
3. useContext
4. useReducer
5. useCallback
6. useMemo
7. useRef
8. useImperativeHandle
9. useLayoutEffect

### useState

以前的函数式组件被成为纯函数组件或者无状态组件，是只能接受父组件传来的 props 并且只能做展示功能，不能使用 state 也没有生命周期。  
现在 State Hook 可以让函数式组件使用状态。  
useState 是 React 的一个 Hook，它是一个方法，可以传入值作为 state 的默认值，返回一个数组，数组的第一项是对应的状态(默认值会赋予状态)，数组的第二项是更新状态的函数。

<iframe src="https://codesandbox.io/s/react-hooks-3823z"></iframe>
 
 
### useEffect

既然 React Hooks 给了函数式组件（或者说是纯函数组件）那么强大的功能(抛弃类组件)，那么组件中总是要会执行副作用操作，纯函数组件保持了函数渲染的纯度，那么要怎么执行副作用呢？  
React Hooks 提供了 Effect Hook，可以在函数组件中执行副作用操作，并且是在函数渲染 DOM 完成后执行副作用操作。

```js
import React, { useEffect } from 'react';
```

useEffect 这个方法传入一个函数作为参数，在函数里面执行副作用代码，并且 useEffec 的第一个参数还支持返回值为一个函数，这个函数执行相当于组件更新和卸载。

```js
import React, { useState, useEffect } from 'react';

const EffectComponent = () => {
  useEffect(() => {
    console.log('useEffect Hook');
  });
  return null;
};
export default EffectComponent;
```


**与类组件生命周期的比较**

我们都知道在类组件中可以在 componentDidMount 和 componentDidUpdate 中执行副作用，那么在函数组件中 useEffect 的参数函数就具有类组件的这两个生命周期的用途，如果 useEffec 的第一个参数有返回值为函数的话，函数的返回值相当于 componentWillUnmount。可以说 useEffect 把这三个 API 合成了一个。  
最常见的做法就是就是在函数参数中写事件注册，在函数的返回函数中写事件销毁。

在类组件中如果想componentDidMount 和 componentDidUpdate 第一次加载后和更新后都有相同的操作，类组件中要如下的重复代码
```js
class Counter extends React.Component{
    state = {count:100};
    add = ()=>{
        this.setState({count:this.state.count+1});
    };
    componentDidMount(){
        this.changeLog();
    }
    componentDidUpdate(){
        this.changeLog();
    }
    changeLog = ()=>{
       console.log(`你已经点击了${this.state.count}次`)
    };
    render(){
        return (
            <>
              <p>{this.state.count}</p>
              <button onClick={this.add}>+</button>
            </>
        )
    }
}
```
useEffect在componentDidMount 和 componentDidUpdate都会执行
```js
  useEffect(() => {
    console.log(`useEffect 执行了${count}`);
  });
```
**useEffect 的第二个参数**

当 useEffect 的第二个参数不写的话(上面都没写),任何更新都会触发 useEffect。那么下面说一下 useEffect 的第二个参数。

> useEffect 的第二个参数是一个数组，表示以来什么 state 和 props 来执行副作用。  
> 第二个参数是一个数组为`[]`,仅在挂载和卸载的时候执行 ,数组为空的时候，useEffect 就相当于 componentDidMoubt 和 componentWillUnmount 这两个生命周期，只在首次渲染和卸载的时候执行。


当数组中值是状态的时候，就会只监听这一个状态的变化。当然数组中可以多个值，监听存放 state 的变化。
```js
const UseEffectComponent = () => {
  const [age, setAge] = useState(100);
  const [name, setName] = useState("小王子");
  useEffect(() => {
    console.log(`setAge任何更新都执行了${age}`);
  });
  useEffect(() => {
    console.log(`setName传入参数才会执行${name}`);
  }, [name]);
  return (
    <>
      <h2>==========2、useEffect========</h2>
      <button
        onClick={() => {
          setAge(age + 1);
        }}
      >
        修改年龄
      </button>
      <button
        onClick={() => {
          setName("小明");
        }}
      >
        修改姓名
      </button>
      <p>第二个参数只有传入name的useEffect 才会执行</p>
      <h1>{age} {name}</h1>
    </>
  );
};
```
**return清除副作用**
 useEffect 如果返回一个函数的话，该函数会在组件卸载和更新时调用
 useEffect 在执行副作用函数之前，会先调用上一次返回的函数
如果要清除副作用，要么返回一个清除副作用的函数
```js
  useEffect(() => {
    let $timer = setInterval(() => setCount(count => count + 1), 3000);
    return () => {
      console.log("组件销毁和更新的时候清除定时器");
      clearInterval($timer);
    };
  }, [count]);
```
### 3、useContext

React16 中更新了 Context API，Context 主要用于爷孙组件的传值问题，新的 Context API 使用订阅发布者模式方式实现在爷孙组件中传值。
React Hooks 出现之后也对 Context API 出了响应的 Hook useContext。同样也是解传值的问题。  
useContext Hook 接受一个 context 对象(由 createContext 创建的对象)作为参数，并返回 Context.Consumer。例如：

```js
const stateContext = createContext('default');
```

- 正确： useContext(stateContext)
- 错误： useContext(stateContext.Consumer)
- 错误： useContext(stateContext.Provider)

使用方式

比如说有一个简单的 ContextComponent 组件

```js
const ContextComponent = () => {
  return (
    <>
      <h1>{value}</h1>
    </>
  );
};
```

通过 Context API 给这个组件发信息。

```js
export default () => (
  <stateContext.Provider value={'Hello React'}>
    <ContextComponent />
  </stateContext.Provider>
);
```

使用 useContext()

```js
const value = useContext(stateContext);
```

使用 useContext，必须在函数式组件中，否则会报错。

![](https://user-gold-cdn.xitu.io/2019/4/16/16a26434bc673f91?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

可以看出，使用 useContext 仍然需要在上层组件中使用<MyContext.Provider>来为下层组件提供 context

### 4、useReducer

看到 useReducer,肯定会想到 Redux，没错它和 Redux 的工作方式是一样的。useReducer 的出现是 useState 的替代方案，能够让我们更好的管理状态。  
useReducer 一共可以接受三个参数并返回当前的 state 与其配套的 dispatch

**第一个参数 reducer**

useReducer 的第一个参数就是形如(state,action) => newState 这样的 reducer，没错就是 reducer，和 redux 完全相同。我们来定义一个简单的 reducer。

```js
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.todo];
    default:
      return state;
  }
};
```

上面是一个简单的 reducer，细心的你会发现，state 参数难道不需要指定一下默认值吗？不需要，React 不需要使用指定 state = initialState，有时候初始值需要依赖于 props，所以初始值在 useReducer 上指定，也许已经猜到第二个参数是什么了？

**第二个参数 initialState**

useReducer 的第二个参数和 Redux 的 createStore 也相同，指定状态的默认值。例如：

```js
useReducer(reducer, [
  {
    id: Date.now(),
    value: 'Hello react',
  },
]);
```

**第三个参数**

useReducer 的第三个参数接受一个函数作为参数，并把第二个参数当作函数的参数执行。主要作用是初始值的惰性求值，这么做可以将用于计算 state 的逻辑提取到 reducer 外部，这也为将来对重置 state 的 action 做处理提供了便利

定义一个 init 函数

```js
function init(initialCount) {
  return [...initialCount];
}
```

useReducer 使用

```js
useReducer(
  reducer,
  [
    {
      id: Date.now(),
      value: 'Hello react',
    },
  ],
  init,
);
```

示例：

```js
let initialCount = 0;
function init(initialCount) {
  return { count: initialCount };
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({ type: 'reset', payload: initialCount })}
      >
        Reset
      </button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

useReducer 的返回值

useReducer 的返回值为一个数组，数组的第一项为当前 state，第二项为与当前 state 对应的 dispatch，可以使用 ES6 的解构赋值拿到这两个

```js
const [state, dispatch] = useReducer(
  reducer,
  [
    {
      id: Date.now(),
      value: 'Hello react',
    },
  ],
  init,
);
```

![](https://user-gold-cdn.xitu.io/2019/4/17/16a2936ed0c238c4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

**浅比较渲染**

如果 Reducer Hook 的返回值与当前 state 相同，React 将跳过子组件的渲染及副作用的执行。
这种方 react 使用 Objec.is 比较算法来比较 state

### 5、useCallback

useCallback 可以认为是对依赖项的监听，把接受一个回调函数和依赖项数组，返回一个该回调函数的 memoized(记忆)版本，该回调函数仅在某个依赖项改变时才会更新。

```js
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

一个简单的小例子

```js
const CallbackComponent = () => {
  let [count, setCount] = useState(1);
  let [num, setNum] = useState(1);

  const memoized = useCallback(() => {
    return num;
  }, [count]);
  console.log('记忆：', memoized());
  console.log('原始：', num);
  return (
    <>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        {' '}
        count+{' '}
      </button>
      <button
        onClick={() => {
          setNum(num + 1);
        }}
      >
        {' '}
        num+{' '}
      </button>
    </>
  );
};
```

![](https://user-gold-cdn.xitu.io/2019/4/17/16a29794102fee24?imageslim)

如果没有传入依赖项数组，那么记忆函数在每次渲染的时候都会更新。

![](https://user-gold-cdn.xitu.io/2019/4/17/16a297bfe31bd28a?imageslim)

### 6、useMemo

useMemo 主要用来解决使用 React hooks 产生的无用渲染的性能问题。

useMemo 和 useCallback 很像，唯一不同的就是

useCallback(fn, deps) 相当于 useMemo(() => fn, deps)

```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
//computeExpensiveValue （）=>函数
```

### 7、useRef

React16 出现了可用 React.createRef 创建 ref 的方法，因此也出了这样一个 Hook。

```js
this.ref=React.createRef()
<input ref={this.ref}>
//通过this.ref.current获取节点
```

useRef 使用语法：

```js
const refContainer = useRef(initialValue);
```

useRef 返回一个可变的 ref 对象，useRef 接受一个参数绑定在返回的 ref 对象的 current 属性上，返回的 ref 对象在整个生命周期中保持不变。

```js
const RefComponent = () => {
  let inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  });
  return <input type="text" ref={inputRef} />;
};
```

上面例子在 input 上绑定一个 ref，使得 input 在渲染后自动焦点聚焦。

![](https://user-gold-cdn.xitu.io/2019/4/17/16a29869563b5058?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 8、useImperativeHandle

useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值。

就是说：当我们使用父组件把 ref 传递给子组件的时候，这个 Hook 允许在子组件中把自定义实例附加到父组件传过来的 ref 上，有利于父组件控制子组件。

```js
useImperativeHandle(ref, createHandle, [deps]);
```

```js
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.value = 'Hello';
    },
  }));
  return <input ref={inputRef} />;
}
FancyInput = forwardRef(FancyInput);

export default () => {
  let ref = useRef(null);
  useEffect(() => {
    console.log(ref);
    ref.current.focus();
  });
  return (
    <>
      <FancyInput ref={ref} />
    </>
  );
};
```

上面是一个父子组件中 ref 传递的例子，使用到了 forwardRef(这是一个高阶函数，主要用于 ref 在父子组件中的传递)，使用 useImperativeHandle 把第二个参数的返回值绑定到父组件传来的 ref 上。

![](https://user-gold-cdn.xitu.io/2019/4/17/16a2a0cbb357a733?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 9、useLayoutEffect

这个钩子函数和 useEffect 相同，都是用来执行副作用。但是它会在所有的 DOM 变更之后同步调用 effect。useLayoutEffect 和 useEffect 最大的区别就是一个是同步一个是异步。
从这个 Hook 的名字上也可以看出，它主要用来读取 DOM 布局并触发同步渲染，在浏览器执行绘制之前，useLayoutEffect 内部的更新计划将被同步刷新。
官网建议还是尽可能的是使用标准的 useEffec 以避免阻塞视觉更新。

## 6、Hook 的执行机制

**第一个：函数调用完之后会把函数中的变量清除，但 ReactHook 是怎么复用状态呢？**

React 保持对当先渲染中的组件的追踪，每个组件内部都有一个「记忆单元格」列表。它们只不过是我们用来存储一些数据的 JavaScript 对象。当你用 useState() 调用一个 Hook 的时候，它会读取当前的单元格（或在首次渲染时将其初始化），然后把指针移动到下一个。这就是多个 useState() 调用会得到各自独立的本地 state 的原因。  
之所以不叫 createState，而是叫 useState，因为 state 只在组件首次渲染的时候被创建。在下一次重新渲染时，useState 返回给我们当前的 state。

```js
const [count, setCount] = useState(1);
setCount(2);
//第一次渲染
//创建state，
//设置count的值为2
//第二次渲染
//useState(1)中的参数忽略，并把count赋予2
```

**React 是怎么区分多次调用的 hooks 的呢，怎么知道这个 hook 就是这个作用呢？**

React 靠的是 Hook 调用的顺序。在一个函数组件中每次调用 Hooks 的顺序是相同。借助官网的一个例子：

```js
// ------------
// 首次渲染
// ------------
useState('Mary'); // 1. 使用 'Mary' 初始化变量名为 name 的 state
useEffect(persistForm); // 2. 添加 effect 以保存 form 操作
useState('Poppins'); // 3. 使用 'Poppins' 初始化变量名为 surname 的 state
useEffect(updateTitle); // 4. 添加 effect 以更新标题

// -------------
// 二次渲染
// -------------
useState('Mary'); // 1. 读取变量名为 name 的 state（参数被忽略）
useEffect(persistForm); // 2. 替换保存 form 的 effect
useState('Poppins'); // 3. 读取变量名为 surname 的 state（参数被忽略）
useEffect(updateTitle); // 4. 替换更新标题的 effect

// ...
```

在上面 hook 规则的时候提到 Hook 一定要写在函数组件的对外层，不要写在判断、循环中，正是因为要保证 Hook 的调用顺序相同。

如果有一个 Hook 写在了判断语句中

```js
if (name !== '') {
  useEffect(function persistForm() {
    localStorage.setItem('formData', name);
  });
}
```

借助上面例子，如果说 name 是一个表单需要提交的值，在第一次渲染中，name 不存在为 true，所以第一次 Hook 的执行顺序为

```js
useState('Mary'); // 1. 使用 'Mary' 初始化变量名为 name 的 state
useEffect(persistForm); // 2. 添加 effect 以保存 form 操作
useState('Poppins'); // 3. 使用 'Poppins' 初始化变量名为 surname 的 state
useEffect(updateTitle); // 4. 添加 effect 以更新标题
```

在第二次渲染中，如果有表单中有信息填入，那么 name 就不等于空，Hook 的渲染顺序如下：

```js
useState('Mary'); // 1. 读取变量名为 name 的 state（参数被忽略）
// useEffect(persistForm)  // 🔴 此 Hook 被忽略！
useState('Poppins'); // 🔴 2 （之前为 3）。读取变量名为 surname 的 state 失败
useEffect(updateTitle); // 🔴 3 （之前为 4）。替换更新标题的 effect 失败
```

这样就会引发 Bug 的出现。因此在写 Hook 的时候一定要在函数组件的最外层写，不要写在判断，循环中。

## 7、自定义 Hook

自定义 hooks 可以说成是一种约定而不是功能。当一个函数以 use 开头并且在函数内部调用其他 hooks，那么这个函数就可以成为自定义 hooks，比如说 useSomething。  
自定义 Hooks 可以封装状态，能够更好的实现状态共享。  
我们来封装一个数字加减的 Hook

```js
const useCount = (num) => {
  let [count, setCount] = useState(num);
  return [count, () => setCount(count + 1), () => setCount(count - 1)];
};
```

这个自定义 Hook 内部使用 useState 定义一个状态，返回一个数组，数组中有状态的值、状态++的函数，状态--的函数。

```js
const CustomComp = () => {
  let [count, addCount, redCount] = useCount(1);

  return (
    <>
      <h1>{count}</h1>
      <button onClick={addCount}> + </button>
      <button onClick={redCount}> - </button>
    </>
  );
};
```

主函数中使用解构赋值的方式接受这三个值使用，这是一种非常简单的自定义 Hook。如果项目大的话使用自定义 Hook 会抽离可以抽离公共代码，极大的减少我们的代码量，提高开发效率。

[实例代码](https://gitee.com/ycwdss/webpack-react)

[十个案例学会 React Hooks](https://blog.csdn.net/sinat_17775997/article/details/89208701)

[React 设计模式](https://github.com/MuYunyun/blog/tree/master/React/React%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F)
