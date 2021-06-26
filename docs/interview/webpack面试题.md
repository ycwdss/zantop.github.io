---
title: webpack面试题
---

## loader 与 plugin 区别？

loader 是处理加载资源的（css js）
plugin 是增强处理，（js css 压缩）

## 构建流程

`初始化参数`=>`开始编译`=>`确认入口entery`=>`编译模块加载loader`=>`完成编译`=>`输出资源`=>`输出完成`

## source map 是什么？生产环境怎么用？
