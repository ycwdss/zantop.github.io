# redux-thunk 解析

首先看下在 React 中发送异步请求获取数据

```js
componentDidMount() {
  axios.get('/list.json').then((res) => {
    store.dispatch({type:FETCH_DATA,payload:res.data})
  })
}
```

在 componentDidMount 做了一个 ajax 数据的请求，咋一看可能没有什么问题，但是如果我们把这种异步的请求，或者把一些非常复杂的逻辑都放在组件里进行实现时，这个组件会显得过于臃肿。

- 如果项目简单可以不使用`redux-thunk`,数据请求在组件中完成。
- 当组件中有复杂的异步请求时，为了减少组件的复杂程度，把异步请求使用此中间件放在 actionCreator 集中管理。

```js
import React, { Component } from 'react';
import actions from '../store/actions/thunk';
import { connect } from 'react-redux';

import css from '../styles/saga.scss';
/* @connect(
    state => state.thunk,
    actions
) */
class Thunk extends Component {
  constructor(props) {
    super(props);
  }
  /*   static getInitialProps(props) {
        console.log('数据仓库');
        console.log(props.store);
        console.log(props.store.getState());
        const { store } = props;
        const { topicTypes, topicLists, isFetching } = store.getState().thunk;

        return { topicTypes, topicLists, isFetching };
    } */
  handleSwitch = (e, key) => {
    this.props.fetchTopic(key);
  };
  handleFetchType = () => {
    this.props.fetchType();
  };
  render() {
    console.log('渲染了 ');
    console.log(this.props);
    const { topicTypes, topicLists, isFetching } = this.props;
    return (
      <div className={css.saga}>
        <button onClick={this.handleFetchType}>点我</button>
        <div className={css.topic}>
          <ul className={css.topictype}>
            {topicTypes.map((item, index) => (
              <li key={item.id} onClick={(e) => this.handleSwitch(e, item.id)}>
                {item.title}
              </li>
            ))}
          </ul>
          {isFetching ? (
            <div>加载中…</div>
          ) : (
            <ul className={css.topicList}>
              {topicLists.map((item, index) => (
                <li key={item.id}>
                  <a href={item.url}>{item.title}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

//  export default Thunk;
const mapStateToProps = (state) => {
  const { topicTypes, topicLists, isFetching } = state.thunk;
  return {
    topicTypes,
    topicLists,
    isFetching,
  };
};
const mapDispatchToProps = (dispatch) => ({
  fetchType: () => dispatch(actions.fetchType()),
  fetchTopic: (id) => dispatch(actions.fetchTopic(id)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Thunk);
```

加入中间件

```js
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

const store = createStore(reducers, applyMiddleware(thunk));
```

redux-thunk 主要的功能就是可以让我们 dispatch 一个函数，而不只是普通的 Object。

```js
//actions
import fetch from '../../services/api';

export const actionTypes = {
  REQUEST: 'REQUEST',
  TYPESUCCESS: 'TYPESUCCESS',
  TOPICSUCCESS: 'TOPICSUCCESS',
  ERROR: 'ERROR',
};
//reudx-thunk
const actions = {
  fetchType: () => async (dispatch) => {
    try {
      dispatch({ type: actionTypes.REQUEST });
      const { Data } = await fetch.topicType();
      dispatch({ type: actionTypes.TYPESUCCESS, payload: Data });
      await dispatch(actions.fetchTopic(Data[0].id));
    } catch (error) {
      dispatch({ type: actionTypes.ERROR, error });
    }
  },
  fetchTopic: (id) => async (dispatch) => {
    try {
      dispatch({ type: actionTypes.REQUEST });
      let { Data } = await fetch.topicList(id);
      dispatch({ type: actionTypes.TOPICSUCCESS, payload: Data });
    } catch (error) {
      dispatch({ type: actionTypes.ERROR, error });
    }
  },
};
export default actions;
```

redux-thunk 缺点：  
dispatch(action creator),但是函数内部极为复杂。如果需要为每一个异步操作都如此定义一个 action，显然 action 不易维护。
