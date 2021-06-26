# React 生命周期

![一张图看懂react生命周期](https://note.youdao.com/yws/api/personal/file/477A0F3DFA3F4C57B44076C77F454B14?method=download&shareKey=c9c24fb48fd2f002298a1875ce2d9fa5)

1. 第一阶段：在这里完成了组件的加载和初始化
   > 1. constructor
   > 1. componentWillMount
   > 1. render
   > 1. componentDidMount
2. 第二阶段：组件的更新阶段，可能是外部传入的 props 也可能是内部 state 数据的更改；

> 1. componentWillReceiveProps(nextProps)
> 1. shouldComponentUpdate(nextProps,nextState)
> 1. componentWillUpdate(nextProps,nextState)
> 1. render
> 1. componentDidUpdate(prevProps,prevState)

3. 第三阶段：是组件卸载消亡的阶段，这里做一些组件卸载之前对数据的处理。

   > 1. componentWillUnmount

4. 第四个阶段：发生错误时处理

> 1. componentDidCatch（16 新增）

**getDefaultProps：**

对于每个组件实例来讲，这个方法只会调用一次，该组件类的所有后续应用，getDefaultPops 将不会再被调用，其返回的对象可以用于设置默认的 props(properties 的缩写) 值。

**getInitialState：**

对于组件的每个实例来说，这个方法的调用有且只有一次，用来初始化每个实例的 state，在这个方法里，可以访问组件的 props。每一个 React 组件都有自己的 state，其与 props 的区别在于 state 只存在组件的内部，props 在所有实例中共享。

getInitialState 和 getDefaultPops 的调用是有区别的，getDefaultPops 是对于组件类来说只调用一次，后续该类的应用都不会被调用，而 getInitialState 是对于每个组件实例来讲都会调用，并且只调一次。

## 1、初始化

**Mounting**

整个组件按以下顺序完成加载：

constructor() ->componentWillMount()->render()->componentDidMount()

**1、constructor()**

首先通过 constructor 方法完成对 props 和 state 的初始化。其中 props 是 react 从父组件继承过来的，state 需要我们自己去定义。

**2、componentWillMount()**

接着是 componentWillMount()，这个方法执行的时间点是在 props 和 state 初始化之后，render 之前。这个时候可以在里面执行 this.setState()操作，执行 setState()并不会导致页面的渲染，只是单纯的 state 的合并操作。这个是初始化阶段在 render 之前最后一次可以修改组件 state 的机会。这个方法只执行一次，其实你们看图列也可以知道，初始化阶段的方法都是只执行一次的。这个方法相当于在组件渲染之前的准备工作。

**3、render()**

组件渲染，render 应该保持为一个纯函数。不要在里面有操作 DOM 的 Bug，只能通过 this.props 和 this.state 访问数据

**4、componentDidMount()**

componentDidMount()，也是只执行一次。执行的时间点是在 render 之后。下一次重绘组件的入口之前。这个时候已经挂载到了 DOM，所以在这个方法里面可以操作 DOM，当然一般是通过 ref 进行。

此时已可以使用其他类库来操作这个 DOM。在服务端中，该方法不会被调用。当我们需要请求外部接口数据，一般都在这里处理(因为这里处理 ajax，接下来的重绘(updating)阶段就可以直接用数据了)。但是在这里写一堆 ajax 你不觉得很混乱吗，交给 redux 吧。

**Tips: ajax 请求放在 componentWillMount()中还是 componentDidMount()？**

componentDidMount 方法中的代码，是在组件已经完全挂载到网页上才会调用被执行，所以可以保证数据的加载。此外，在这方法中调用 setState 方法，会触发重渲染。所以，官方设计这个方法就是用来加载外部数据用的，或处理其他的副作用代码。

constructor 被调用是在组件准备要挂载的最一开始，所以此时组件尚未挂载到网页上。

componentWillMount 方法的调用在 constructor 之后，在 render 之前，在这方法里的代码调用 setState 方法不会触发重渲染，所以它一般不会用来作加载数据之用，它也很少被使用到。

一般的从后台(服务器)获取的数据，都会与组件上要用的数据加载有关，所以都在 componentDidMount 方法里面作。虽然与组件上的数据无关的加载，也可以在 constructor 里作，但 constructor 是作组件 state 初绐化工作，并不是设计来作加载数据这工作的，所以所有有副作用的代码都会集中在 componentDidMount 方法里。

[React 数据获取为什么一定要在 componentDidMount 里面调用？](https://segmentfault.com/q/1010000008133309/a-1020000008135702)

## 2、更新

首先在你第一次加载的时候，上述的初始化阶段一过去，就不会再有初始化这个阶段了，剩下的都是 props 和 state 的改变导致的不断 updating 的过程，所以我要说初始化的生命周期函数都是只执行一次呢。

这个时候我们的组件已经渲染出来了，用户也能够看到了，那么组件是不是就是一直不变了，那肯定是扯犊子嘛，随着用户的操作，比如点击按钮，发送信息啥的就会导致有新的 props 或者 state 从上层甚至上上层流入到我们刚刚新鲜出炉的组件里，这时就会触发组件的 updating，导致 UI 视图的重绘。

**1、componmentWillReceiveProps(nextProps)**

触发的生命周期函数如下，这里要分两种情况。

> 1. 如果是父组件传入了新的 props，无论是传了新的 key，还是原来的 key 赋予了新的 value。这时会触发的是 componmentWillReceiveProps（nextProps），记住哦，如果仅仅 state 改变，props 没变的时候，是不会触发这个生命周期函数了的，直接就跳过去进行 shouldComponentUpdate()了。
>
> 2. 当然如果没有 props 改变就是第二种情况，直接进行 shouldComponentUpdate()，所以用 componmentWillReceiveProps（）是不是应该小小的考虑一下。

好，说清楚这个分叉的点，我们对 componmentWillReceiveProps 做个说明，首先这个函数执行的时机是父组件更新了子组件的 props 的时候，在这个函数里我们可以获取最新的 props 来更新 props 或者 state。

**2、shouldComponentUpdate(nextProps,nextState)**

从 state 改变还是 props 改变分叉之后都会交汇到一点，shouldComponentUpdate，对没错，这个生命周期函数是重绘组件的阀门，它的返回值是一个 boolean，默认返回 true，如果返回 false，那就简单多了，因为接下来的步骤都不会执行了，所以这是进行 pureRender 优化的函数，说白了就是进行 deepCompare.当然这不是本章重点。

shouldComponentUpdate 返 true 之后就会接着触发下一个生命周期函数

**3、componmentWillUpdate(nextProps,nextState)**

componmentWillUpdate()，其实和初始化阶段的 componentWillMount 差不多，就是重绘前的准备工作。唯一需要注意的是，这里面不能进行 setState（）或者更新 props。因为这个函数自己就会把最新的 state 和 props 设置到 this.state 和 this.props 中，请把对 state 和 props 的更新放到 componmentWillReceiveProps 中好不。

**4、render()**

然后是重绘(re-render)

**5、componmentDidUpdate()**

最后是 componmentDidUpdate（）这个和 componmentDidMount 也差不多，也是可以获取真实 DOM

补充一点，updating 期间的生命周期函数在初始化的时期是不会执行的哦。
直白的说就比如 componmentWillReceiveProps()函数肯定不会在你第一次初始加载组件的时候执行的。

## 3、卸载

**componentWillUnmount(prevProps,prevState)**

每当 React 使用完一个组件，这个组件必须从 DOM 中卸载后被销毁，此时 componentWillUnmout 会被执行，完成所有的清理和销毁工作，在 componentDidMount 中添加的任务都需要再该方法中撤销，如创建的定时器或事件监听器。

[react 生命周期](https://www.jianshu.com/p/c9bc994933d5)

[生命周期](https://www.cnblogs.com/AnnieBabygn/p/6560833.html)

附详图：
![image](https://note.youdao.com/yws/api/personal/file/02D0DC9E44B54AB6A7AF59617865F687?method=download&shareKey=db876665ed86f95d52219221bcd00c64)


```js
===




```

## 4、16.x生命周期变更

react16的生命周期新引入新的生命周期函数：  
  `getDerivedStateFromProps，getSnapshotBeforeUpdate，getDerivedStateFromError,componentDidCatch`,  

弃用的三个生命周期函数：   
`componentWillMount、componentWillReceivePorps，componentWillUpdate`。

**1、getDerivedStateFromProps(props, state)**


该函数在组件挂载阶段和后续更新阶段调用，根据 props 和 state 两个参数，计算出预期的状态改变，返回一个对象表示新的 state进行更新；如果不需要更新，返回 null 即可。该函数用来替代 componentWillReceiveProps。

简单来说就是2个功能：  

- 无条件的根据 prop 来更新内部 state，也就是只要有传入 prop 值， 就更新 state
- 只有 prop 值和 state 值不同时才更新 state 值

示例1：  
```js
class Table extends React.Component {
    state = {
        list: []
    }
    static getDerivedStateFromProps (props, state) {
        return {
            list: props.list
        }
    }
    render () {
       // ....  展示 list
    }
}
``` 

对于这种无条件从 prop 中更新 state，我们完全没必要使用这个生命周期，直接对 prop 值进行操作就好了，无需用 state 值类保存

示例2：  
```js
Class ColorPicker extends React.Component {
    state = {
        color: '#000000'
    }
    static getDerivedStateFromProps (props, state) {
        if (props.color !== state.color) {
            return {
                color: props.color
            }
        }
        return null
    }
    ... // 选择颜色方法
    render () {
        .... // 显示颜色和选择颜色操作
    }
}

```
一开始是从props传过来颜色值，如果后续继续操作color就会发现color并不会更新，因为setState内部的color同样会走`getDerivedStateFromProps`,color还是props传入的color

修复它：  

```js
Class ColorPicker extends React.Component {
    state = {
        color: '#000000',
        prevPropColor: ''
    }
    static getDerivedStateFromProps (props, state) {
        if (props.color !== state.prevPropColor) {
            return {
                color: props.color
                prevPropColor: props.color
            }
        }
        return null
    }
    ... // 选择颜色方法
    render () {
        .... // 显示颜色和选择颜色操作
    }
}

```
通过保存一个之前 prop 值，可以在只有 prop 变化时才去修改 state。这样就解决上述的问题。

**2、getSnapshotBeforeUpdate(prevProps, prevState)**

该函数在render之后被调用，可以读取但无法使用DOM的时候。它使得组件能在发生更改之前从 DOM 中捕获一些信息(例如，滚动位置)。返回值将作为componentDidUpdate的第三个参数。该函数配合componentDidUpdate, 可以替代componentWillUpdate。

```js
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('getSnapshotBeforeUpdate');
    return 'react16';
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('snapshot = ', snapshot);
  }

```

**3、getDerivedStateFromError()**  
此生命周期会在后代组件抛出错误后被调用。 它将抛出的错误作为参数，并返回一个值以更新 state。
```js 
 static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染可以显降级 UI
    return { hasError: true };
  }
```

**4、componentDidCatch(error，info)**

任何一处的javascript会触发该函数。

```js
componentDidCatch(error, info) {
  // 获取到javascript错误
}
```


总结:  

react16更新后的生命周期可以总结为：

**组件挂载阶段**

- constructor
- getDerivedStateFromProps
- render
- componentDidMount


**组件更新阶段**

- getDerivedStateFromProps
- shouldComponentUpdate
- render
- getSnapshotBeforeUpdate
- componentDidUpdate


**组件卸载阶段**

- componentWillUnmount


[React v16.3 版本新生命周期函数浅析及升级方案](https://juejin.im/post/5ae6cd96f265da0b9c106931)