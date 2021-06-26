# createjs开发

##  1、构成

EaselJS：用于 Sprites、动画、向量和位图的绘制，创建 HTML5 Canvas 上的交互体验（包含多点触控）

TweenJS：用于做动画效果

SoundJS：音频播放引擎

PreloadJS：网站资源预加载

## 2、EaselJS
[PreloadJS基础使用](https://www.jianshu.com/p/11aea89260a2)
[一篇文章带你快速入门createjs](https://www.cnblogs.com/beidan/p/7055422.html)
[一篇文章带你快速入门 CreateJS](https://aotu.io/notes/2017/07/19/createjs/)
[createjs开发h5游戏: 指尖大冒险](https://segmentfault.com/a/1190000012633633#articleHeader5)



```js
<style scoped>
.container {
  background-color: #111d23;
}
.loading {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #f55b50;
  background-color: #111d23;
}
</style>
<template>
  <div class="container">
    <div class="loading" v-show="!progressEnd">{{progress}}</div>
    <canvas id="canvas" v-show="progressEnd"></canvas>
  </div>
</template>

<script>
import { manifestJson } from '../config'
export default {
  data() {
    return {
      progress: 0, //进度
      progressEnd: false, //加载完成
      preload: null, //加载资源
      w: window.innerWidth, //画布宽度
      h: window.innerHeight //画布高度
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.LoadQueue()
      this.resizeCanvas()
    },
    resizeCanvas() {
      window.addEventListener(
        'resize',
        () => {
          this.w = window.innerWidth
          this.h = window.innerHeight
        },
        false
      )
    },
    //加载资源
    LoadQueue() {
      // 统计加载进度
      let loadCount = 0
      this.preload = new createjs.LoadQueue(false, 'https://h5.boqiicdn.com/')
      // 加载进度
      this.preload.on('progress', e => {
        this.progress = `${this.preload.progress * 100}%`
      })
      // 所有资源加载完毕后的回调
      this.preload.on('complete', e => {
        console.log(e.item)
        //加载完成
        this.progressEnd = true
        //展示canvas
        this.canvas()
      })
      // 使用preload预加载指定资源
      this.preload.loadManifest(manifestJson)
    },
    //canvas展示
    canvas() {
      let canvas = document.querySelector('#canvas')
      let contain = new createjs.Container()
      let stage = new createjs.Stage(canvas)
      canvas.width = this.w
      canvas.height = this.h
      console.log(this.preload.getResult('p1'))
      const p1 = this.createImage(stage, 'p1', this.w, this.h, 0, 0)
      createjs.Tween.get(p1).to({ alpha: 1 }, 300)

      createjs.Ticker.setFPS(60)
      createjs.Ticker.addEventListener('tick', tick)
      function tick() {
        stage.update()
      }
    },
    //处理图片
    createImage(stage, id, width, height, x, y) {
      var image = new createjs.Bitmap(this.preload.getResult(id))
      image.x = x
      image.y = y
      image.alpha = 0
      image.scaleX = width / this.preload.getResult(id).width
      image.scaleY = height / this.preload.getResult(id).height
      stage.addChild(image)
      stage.update()
      return image
    }
  },
  watch: {
    w(newValue, oldValue) {
      this.w = newValue
    },
    h(newValue, oldValue) {
      this.h = newValue
    }
  }
}
</script>

```
## 3、参考资料

[一篇文章带你快速入门 CreateJS](https://aotu.io/notes/2017/07/19/createjs/index.html)  
[CreateJS 视频课程](http://www.jikexueyuan.com/course/createjs/)  
[createjs开发h5游戏: 指尖大冒险](https://segmentfault.com/a/1190000012633633)  
