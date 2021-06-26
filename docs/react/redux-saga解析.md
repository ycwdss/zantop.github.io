# redux-saga 解析

sagas 包含 3 个部分，用于联合执行任务

```js
worker saga
//做所有的工作，如调用 API，进行异步请求，并且获得返回结果
watcher saga
//监听被 dispatch 的 actions，当接收到 action 或者知道其被触发时，调用 worker saga 执行任务
root saga
//立即启动 sagas 的唯一入口
```

## 1、 Saga 辅助函数

redux-saga 提供了一些辅助函数，用来在一些特定的 action 被发起到 Store 时派生任务，下面我先来讲解两个辅助函数：takeEvery 和 takeLatest

### 1.1、 **takeEvery**

takeEvery 就像一个流水线的洗碗工，过来一个脏盘子就直接执行后面的洗碗函数，一旦你请了这个洗碗工他会一直执行这个工作，绝对不会停止接盘子的监听过程和触发洗盘子函数

例如：每次点击 按钮去 Fetch 获取数据时时，我们发起一个 FETCH_REQUESTED 的 action。 我们想通过启动一个任务从服务器获取一些数据，来处理这个 action，类似于

```js
window.addEventLister('xxx', fn);
```

当 dispatch xxx 的时候，就会执行 fn 方法，

首先我们创建一个将执行异步 action 的任务(也就是上边的 fn)：

```js
// put：你就认为put就等于 dispatch就可以了；
import { take, put, fork, select } from 'redux-saga/effects';
import { actionTypes } from '../actions/saga';
import fetch from '../../services/api';
/**
 *  worker saga  作用函数：执行异步任务
 */
export function* fetchTypes() {
  try {
    const { Data } = yield call(fetch.topicType);
    yield put({ type: actionTypes.TYPE_SUCCESS, payload: Data });
  } catch (error) {
    yield put({ type: actionTypes.TYPE_ERROR, error });
  }
}
//watch saga  监听函数: 监听对应type的action，当被触发时执行worker saga
function* watchFetchTypes() {
  yield takeEvery(actionTypes.TYPE_REQUEST, fetchTypes);
}
export default [fork(watchFetchTypes)];
```

在 takeEvery 的情况中，被调用的任务无法控制何时被调用， 它们将在每次 action 被匹配时一遍又一遍地被调用。并且它们也无法控制何时停止监听。

**注意**：上面的 takeEvery 函数可以使用下面的写法替换

```js
function* watchFetchTypes() {
  while (true) {
    yield take(actionTypes.TYPE_REQUEST);
    yield fork(fetchTypes);
  }
}
```

takeEvery 与 take 的区别？

- takeEvery 会一直监听传过来的 action type 并执行 worker saga 异步任务函数
- take 只是简单监听 action type，后续 fork 或 call 调用 worker saga 异步任务 函数

### 1.2、 **takeLatest**

辅助函数 takeEvery 允许获取数据的多个实例并发。也就是说，创建一个新的获取数据任务无需等待之前的任务结束。如果只想获取最新请求的响应，可以使用 takeLatest 辅助函数, 在某时刻，它只允许一个获取数据任务执行。

```js
export function* fetchNewsType() {
  try {
    yield delay(9000);
    const { data } = yield call(fetch.newsType);
    yield put({ type: actionTypes.TYPE_SUCCESS, payload: data });
  } catch (error) {
    yield put({ type: actionTypes.TYPE_ERROR, error });
  }
}
export function* fetchNewsList(action) {
  console.log('would了');
  console.log(action);
  try {
    const { data } = yield call(fetch.newsList, action.id);
    yield put({ type: actionTypes.LIST_SUCCESS, payload: data });
  } catch (error) {
    yield put({ type: actionTypes.LIST_ERROR, error });
  }
}
function* watchFetchTypes() {
  yield takeLatest(actionTypes.TYPE_REQUEST, fetchNewsType);
  // yield takeEvery(actionTypes.LIST_REQUEST, fetchNewsList);
  // yield takeLatest(actionTypes.TOPIC_REQUEST, fetchTopics);
}
```

为了模拟延迟接口返回数据，加入 delay 延迟，多次点击请求，可以看到每次都触发`actionTypes.TYPE_REQUEST`,但是等待后只会请求
最后一次发起的请求,之前的`actionTypes.TYPE_REQUEST`都会被取消。

看 takeLastes 源码可以看到

```js
const takeLatest = (patternOrChannel, saga, ...args) =>
  fork(function* () {
    let lastTask;
    while (true) {
      const action = yield take(patternOrChannel);
      if (lastTask) {
        yield cancel(lastTask); // cancel is no-op if the task has already terminated
      }
      lastTask = yield fork(saga, ...args.concat(action));
    }
  });
```

这个 takeLatest 是也是由 redux-saga 的 fork 与 take 构成的高阶函数构成。

**fork:**

- fork 是非阻塞的，非阻塞就是遇到它，不需要等它执行完, 就可以直接往下运行；
- fork 的另外一个同胞兄弟 call 是阻塞，阻塞的意思就是一定要等它执行完, 才可以直接往下运行；
- fork 是返回一个任务，这个任务是可以被取消的；而 call 就是它执行的正常返回结果！（非常重要）

**take:**

- take 是阻塞的，主要用来监听 action.type 的，只有监听到了，才会继续往下执行；

当运行到

```js
const action = yield take(patternOrChannel)
```

时，函数就会停在这里了，只有当这个 take 监听到 action.type 的时候，才会继续往下执行；

```js
 lastTask = yield fork(saga, ...args.concat(action))
```

因为 fork 非阻塞的，每次执行都会返回一个`lastTask`,下次在走 action type 时，就会取消上一个任务。所以用 takeLatest 来处理重复点击的问题，无敌好用！

## 2、 Effect Creators

### 2.1、**take(pattern)**

take 函数可以理解为监听未来的 action，它创建了一个命令对象，告诉 middleware 等待一个特定的 action， Generator 会暂停，直到一个与 pattern 匹配的 action 被发起，才会继续执行下面的语句，也就是说，take 是一个阻塞的 effect

```js
function* watchFetchData() {
  while (true) {
    // 监听一个type为 'FETCH_REQUESTED' 的action的执行，直到等到这个Action被触发，才会接着执行下面的 		yield fork(fetchData)  语句
    yield take('FETCH_REQUESTED');
    yield fork(fetchData);
  }
}
```

take 我们可以想象成一个快递员，他只负责把脏盘子送过来，至于你要对盘子做什么他不管，而且他是一次性收费的，送完一次快递他就走了，所以我们可以具体得安排我们需要几个脏盘子，你也可以安排先送几个盘子再一起洗还是送一个洗一个

```js
//收三个盘子再洗
function* 餐盘收集处() {
	while(true) {
        let one = yield take('脏盘子'）
        let two = yield take('脏盘子'）
        let three = yield take('脏盘子'）
        let 一堆盘子 = yield 洗盘子(one,two,three）
        yield put（{type:'放盘子'，盘子： 一堆盘子}）
	}
}

//收一个洗一个
function* 餐盘收集处() {
	while(true) {
        let one = yield take('脏盘子'）
        let 一个盘子 = yield 洗盘子(one）
        yield put（{type:'放盘子'，盘子： 一个盘子}）
	}
}
```

因为 take 方法类似于一次性使用得所以经常和 while 搭配，可以保持一直监听得状态，但是又可以有效的控制流程

### 2.2、**put(action)**

put 函数是用来发送 action 的 effect，你可以简单的把它理解成为 redux 框架中的 dispatch 函数，当 put 一个 action 后，reducer 中就会计算新的 state 并返回，注意： put 也是阻塞 effect

```js
export function* fetchTypes() {
  try {
    const { Data } = yield fetch.topicType();
    yield put({ type: actionTypes.TYPESUCCESS, payload: Data });
  } catch (err) {
    yield put({ type: actionTypes.ERROR });
  }
}
```

### 2.3、**call(fn, ...args)**

call 函数你可以把它简单的理解为就是可以调用其他函数的函数，它命令 middleware 来调用 fn 函数， args 为函数的参数，注意： fn 函数可以是一个 Generator 函数，也可以是一个返回 Promise 的普通函数，call 函数也是阻塞 effect

```js
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function* removeItem() {
  try {
    // 这里call 函数就调用了 delay 函数，delay 函数为一个返回promise 的函数
    return yield call(delay, 500);
  } catch (err) {
    yield put({ type: actionTypes.ERROR });
  }
}
```

在来看，先来看一个监听 PRODUCTS_REQUESTED action 的 Saga：

```js
import { takeEvery } from 'redux-saga/effects';
import Api from './path/to/api';

function* fetchProducts() {
  const products = yield Api.fetch('/products');
  console.log(products);
}

function* watchFetchProducts() {
  yield takeEvery('PRODUCTS_REQUESTED', fetchProducts);
}
```

上例中在 fetchProducts Saga 中执行了 Api.fetch('/products') 函数，该函数会立即执行返回一个 Promise。清晰明了，但是对于测试环节这却带来了不便。Promise 是值还是方法？因此在 Saga 中不生成立即执行的异步函数，使用函数调用的描述来替代。

```js
import { call } from 'redux-saga/effects';

function* fetchProducts() {
  const products = yield call(Api.fetch, '/products');
  // ...
}
```

效用接口 call 将异步函数转换成 Javascript 纯对象（效用对象），将该效用对象作为指令交给中间件执行，完毕后将结果返回给 Saga 。

```js
// Effect -> call the function Api.fetch with `./products` as argument
{
  CALL: {
    fn: Api.fetch,
    args: ['./products']
  }
}
```

注意： call 只是转换作用，此时异步函数还没有执行。

在测试环节中只需对比结果是否是所期望的纯对象即可：

```js
import { call } from 'redux-saga/effects';
import Api from '...';

const iterator = fetchProducts();

// expects a call instruction
assert.deepEqual(
  iterator.next().value,
  call(Api.fetch, '/products'),
  "fetchProducts should yield an Effect call(Api.fetch, './products')",
);
```

效用接口 call 同样也适合对象方法：

```js
yield call([obj, obj.method], arg1, arg2, ...) // as if we did obj.method(arg1, arg2 ...)
yield apply(obj, obj.method, [arg1, arg2, ...])
```

### 2.4、**fork(fn, ...args)**

fork 函数和 call 函数很像，都是用来调用其他函数的，但是 fork 函数是非阻塞函数，也就是说，程序执行完 yield fork(fn， args) 这一行代码后，会立即接着执行下一行代码语句，而不会等待 fn 函数返回结果后，在执行下面的语句

```js
import { fork } from 'redux-saga/effects';

export default function* rootSaga() {
  // 下面的四个 Generator 函数会一次执行，不会阻塞执行
  yield fork(addItemFlow);
  yield fork(removeItemFlow);
  yield fork(toggleItemFlow);
  yield fork(modifyItem);
}
```

### 2.5、**select(selector, ...args)**

select 函数是用来指示 middleware 调用提供的选择器获取 Store 上的 state 数据，你也可以简单的把它理解为 redux 框架中获取 store 上的 state 数据一样的功能 ：store.getState()

```js
export function* toggleItemFlow() {
  // 通过 select effect 来获取 全局 state上的 `getTodoList` 中的 list
  let tempList = yield select((state) => state.getTodoList.list);
}
```

### 2.6、**all**

all 提供了一种并行执行异步请求的方式。之前介绍过执行异步请求的 api 中，大都是阻塞执行，只有当一个 call 操作放回后，才能执行下一个 call 操作，call 提供了一种类似 Promise 中的 all 操作，可以将多个异步操作作为参数参入 all 函数中，
如果有一个 call 操作失败或者所有 call 操作都成功返回，则本次 all 操作执行完毕。

```js
import { all, call } from 'redux-saga/effects'
// correct, effects will get executed in parallel
const [users, repos]  = yield all([
  call(fetch, '/users'),
  call(fetch, '/repos')
])
```

### 2.7、**race**

有时候当我们并行的发起多个异步操作时，我们并不一定需要等待所有操作完成，而只需要有一个操作完成就可以继续执行流。这就是 race 的用处。
他可以并行的启动多个异步请求，只要有一个 请求返回（resolved 或者 reject），race 操作接受正常返回的请求，并且将剩余的请求取消。

```js
import { race, take, put } from 'redux-saga/effects'

function* backgroundTask() {
  while (true) { ... }
}

function* watchStartBackgroundTask() {
  while (true) {
    yield take('START_BACKGROUND_TASK')
    yield race({
      task: call(backgroundTask),
      cancel: take('CANCEL_TASK')
    })
  }
}

```

reudx-saga

- 集中处理了所有的异步操作，异步接口部分一目了然
- action 是普通对象，这跟 redux 同步的 action 一模一样
- 通过 Effect ，方便异步接口的测试
- 通过 worker 和 watcher 可以实现非阻塞异步调用，并且同时可以实现非阻塞调用下的事件监听
- 异步操作的流程是可以控制的，可以随时取消相应的异步操作

[聊一聊 redux 异步流之 redux-saga](https://www.jianshu.com/p/e84493c7af35)  
[从 redux-thunk 到 redux-saga 实践 ](https://github.com/Pines-Cheng/blog/issues/9)  
[Redux-saga 学习笔记](https://www.cnblogs.com/libin-1/p/6858558.html)  
[记一次 redux-saga 的项目实践总结](https://juejin.im/post/5bd2e1eaf265da0ae505583b#heading-1)  
[一篇文章总结 redux、react-redux、redux-saga](https://juejin.im/post/5ce0ae0c5188252f5e019c2c)  
[redux-saga 初级学习教程](https://www.jianshu.com/p/f3c7594c4fb4)  
[redux-saga 入门](https://www.jianshu.com/p/05b73d826425)  
[浅析 redux-saga](http://blog.poetries.top/2018/08/29/redux-saga-and-redux-thunk/)  
[redux-saga 指北](https://juejin.im/post/5ad83a70f265da503825b2b4#heading-1)
