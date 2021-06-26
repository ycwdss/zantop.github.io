# vuex 状态管理

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。
处理个复杂组件之间的数据传递与管理。

## 非 vuex 组件之间数据传递

### 1、父传子 props

![rr](http://open.zantop.cn/props-1.png)
实例：

```html
<!-- 父组件 -->
<template>
  <div id="app">
    <div>父组件：</div>
    <input v-model="msg" />
    <div>子组件：</div>
    <Child :msg="msg" />
  </div>
</template>
```

```js
import Child from './components/child';
export default {
  name: 'app',
  data() {
    return {
      msg: '',
    };
  },
  components: {
    Child,
  },
};
```

子组件：

```html
<!-- 子组件通过props接收 -->
<template>
  <div class="hello">{{msg}}</div>
</template>
```

```js
export default {
  name: 'child',
  props: {
    msg: {
      type: String,
      default: '',
      required: true,
    },
  },
};
```

### 2、子传父`$emit`

![emit](http://open.zantop.cn/emit-1.png)

```html
<!-- 子组件 -->
<template>
  <div class="hello">
    <input v-model="msg" @input="handleInput" />
  </div>
</template>
```

```js
export default {
  name: 'child',
  data() {
    return {
      msg: '',
    };
  },
  methods: {
    handleInput() {
      this.$emit('sendByChild', this.msg);
    },
  },
};
```

父组件

```html
<template>
  <div id="app">
    <div>父组件：{{msg}}</div>
    <div>子组件：</div>
    <Child @sendByChild="receiveByParent" />
  </div>
</template>
```

```js
import Child from './components/child';
export default {
  name: 'app',
  data() {
    return {
      msg: '',
    };
  },
  components: {
    Child,
  },
  methods: {
    receiveByParent(val) {
      this.msg = val;
    },
  },
};
```

### 3、非父子

App.vue 引入 2 个子组件 child1,child2, 来实现 child1===>child2

![emit](http://open.zantop.cn/bus.png)

```html
<template>
  <div id="app">
    父组件
    <div>子组件1：</div>
    <Child1 />
    <div>子组件2：</div>
    <Child2 />
  </div>
</template>
```

```js
import Child1 from './components/child1';
import Child2 from './components/child2';
export default {
  name: 'app',
  data() {
    return {
      msg: '',
    };
  },
  components: {
    Child1,
    Child2,
  },
  methods: {},
};
```

定义个中心事件转发 bus.js

child1 组件：

```html
<!-- 通过Bus.$emit派发事件 -->
<template>
  <div class="hello">
    <input v-model="msg" @input="handleInput" />
  </div>
</template>
```

```js
import Bus from './../bus.js';
export default {
  name: 'child',
  data() {
    return {
      msg: '',
    };
  },
  methods: {
    handleInput() {
      Bus.$emit('handleChange', this.msg);
    },
  },
};
```

child2 组件：

```html
<!-- Bus.$on接收事件来处理数据 -->
<template>
  <div class="hello">
    {{msg}}
  </div>
</template>
```

```js
import Bus from './../bus.js';
export default {
  name: 'child',
  data() {
    return {
      msg: '',
    };
  },
  mounted() {
    console.log(Bus);
    Bus.$on('handleChange', (v) => (this.msg = v));
  },
  methods: {},
};
```

也可以在 main.js

```js
new Vue({
  data: {
    Hub: new Vue(),
  },
  render: (h) => h(App),
}).$mount('#app');
```

child1

```js
this.$root.Hub.$emit('handleChange', this.msg);
```

child2

```js
this.$root.Hub.$on('handleChange', this.msg);
```

## vuex 管理数据

从一个简单的列子说起，加减法

![emit](http://open.zantop.cn/min.png)

### state

新建文件 store/index.js,在 mian.js 中注入到 vue

index.js

```js
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
//定义个容器
let store = new Vuex.Store({
  state: {
    count: 0,
  },
});
export default store;
```

注入 main.js

```js
import store from './store';
new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
```

在组件中如何取出 state 中 count 的值？

在组件 computed 获取

```js
computed：{
  num(){
   return this.$store.state.count
  }
}
```

### mutations

点加减按钮改变数据,在 methods 对应的方法里 commit 对应的 mutations,可以跟上 payload `{ num: 5 }`

组件中

1、直接提交 mutation handler "add"

```js
this.$store.commit('add', { num: 5 });
```

2、直接使用包含 type 属性的对象

```js
this.$store.commit({ type: 'add', num: 5 });
```

```html
<template>
  <div class="container">
    <div>加减法</div>
    <button @click="handleMin">-</button>
    <span>{{num}}</span>
    <button @click="handleAdd">+</button>
  </div>
</template>
```

```js
export default {
  computed: {
    num() {
      //获取state中的count
      return this.$store.state.count;
    },
  },
  methods: {
    handleAdd() {
      //改变，提交mutation
      //mutation handler的方式提交
      this.$store.commit('add', { num: 5 });
      //type 对象的方式提交
      //this.$store.commit({ type: "add", num: 5 });
    },
    handleMin() {
      //改变，提交mutation
      this.$store.commit('min');
    },
  },
};
```

在 store/index.js 中

```js
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
//定义个容器
let store = new Vuex.Store({
  state: {
    count: 0,
  },
  mutations: {
    add(state, payload) {
      state.count += payload.num;
    },
    min(state, payload) {
      state.count -= payload.num;
    },
  },
});
export default store;
```

mutation 是同步执行的， 如果是异步的话，会有什么影响？

```js
mutations: {
    add(state, payload) {
      //异步处理
      setTimeout(() => state.count += payload.num, 1000)
    },
    min(state, payload) {
      state.count -= payload.num;
    }
  }
```

虽然值是改变了，但最后在控制台看到，state 中 count 还是 0

![emit](http://open.zantop.cn/mut.png)

对后续使用 state 中的 count 是有影响的 vuex 也明确说了，mutations 是处理同步的，如果是处理异步的话，就要用到 actions 了

### actions

action 处理起来类似 mutation，但是它提交的是 mutation，接收一个 context 和 payload，可以打印下 context 是什么？

store/index.js

```js
let store = new Vuex.Store({
  state: {
    count: 0,
  },
  mutations: {
    add(state, payload) {
      state.count += payload.num;
    },
    min(state, payload) {
      state.count -= payload.num;
    },
  },
  actions: {
    //异步操作的action
    addAction(context, payload) {
      console.log(context);
      //提交到mutation add
      context.commit('add', payload);
    },
  },
});
```

在组件中需要 handleAdd 点击的时候，操作 dispatch 一个 action 'addAction'，可以跟上参数 payload

```js
this.$store.dispatch('addAction', { num: 5 });
```

同时在控制台可以看到 state.count 为当前的数值了，其他对此操作不会再受到影响
![emit](http://open.zantop.cn/action1.png)

那么打印出来的 context 可以看下：

```js
commit: ƒ boundCommit(type, payload, options)  //提交mutations
dispatch: ƒ boundDispatch(type, payload)       //可以触发另一个action
getters: {}
rootGetters: {}
rootState: {__ob__: Observer}                 //状态
state: {__ob__: Observer}                     //当前状态
__proto__: Object
```

在一个 action 中可以在 dispatch 一个 action

```js
actions: {
    //异步操作的action
    addAction(context, payload) {
      console.log(context);
      //提交到mutation add
      context.commit("add", payload);
      //可以在action中在触发另一个action
      context.dispatch('textAction',payload)
    }
    textAction(context,payload){
      console.log('我被触发了')
      console.log(payload)
    }
  }
```

如果在组件中在添加显示一个当前的数值，数值只能>=20 的话，那么要怎么处理呢？

不能在 mutations 中直接来做出判断，这样会影响其他的数值，那么可以使用到了 vuex 提供的 getters 来过滤数值了

### getters

getters 类似组件中传 computed，对数据的处理

```js
 getters: {
    filterCount(state) {
      return state.count >= 20 ? 20 : state.count
    }
  },
```

在组件中获取数据 num2

```js
 computed: {
    num() {
      return this.$store.state.count;
    },
    num2() {
      return this.$store.getters.filterCount;
    }
  },
```

在组件中可以看到 getters 对应的 filterCount 点击多次后，如果>=20 后不会再增加
![emit](http://open.zantop.cn/getter1.png)

getters 接收参数 state 和 getter

```js
 getters: {
    filterCount(state, getter) {
      //可以得到getter下的所有函数
      let totalCount = getter.textCount + state.count;
      return totalCount >= 20 ? 20 : state.count
    },
    textCount(state, getter) {
      return 10
    }
  },
```

### mapState

组件中每次取数据，都要用`this.$store.state.count`来获取数据，vuex 提供了 mapState 的辅助函数来获取 state

```js
import { mapState } from "vuex";

 computed: mapState({
    // 箭头函数可使代码更简练
    num: state => state.count
    // 传字符串参数 'count' 等同于 `state => state.count`
    num: 'count',
    // 为了能够使用 `this` 获取局部状态，必须使用常规函数
    num (state) {
      return state.count + 100
    }
  }),
```

当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 mapState 传一个字符串数组。

```js
computed: mapState([
  // 映射 this.count 为 store.state.count
  'count',
]);
```

或者 在 computed 展开

```js
computed: {
  ...mapState([
  // 映射 this.count 为 store.state.count
  'count'
])
}
```

### mapGetters

与 mapState 类似，在 computed 中获取数据

```js
 computed:{
    //使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters({
      num2: "filterCount"
    })
    //如果计算属性节点与getter的节点一直的话，使用数组
     ...mapGetters([
       'filterCount'
     ])
 },
```

### mapActions

在组件 methods 中使用

```js
methods: {
    ...mapActions({
      handleAdd: "addAction"
    }),
    //如果处理函数与actions的函数名一致的话，可以写成数组
    ...mapActions({
      "handleAdd"
    }),
}
```

对于传入参数，可以在组件中传递

```html
<button @click="handleAdd({ num: 5 })">+</button>
```

### mapMutations

也是在 methods 中使用，处理方式与 mapActions 类似

### Module

[vuex 官方文档](https://vuex.vuejs.org/zh/guide/modules.html)
