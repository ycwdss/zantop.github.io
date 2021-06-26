# git 提交规范

## 【分支规范】

## 永久分支

- master：主分支只用来发布重大版本。所有提供给用户使用的正式版本，都在这个主分支上发布；
- develop：日常开发应该基于此分支来完成；

## Master/Devlop

Devlop 分支基于 Master 分支创建，想正式对外发布就在 Master 分支上，对 Develop 分支进行"合并"（merge）,并打上 tag.
<img src="http://open.zantop.cn/develop.png" width="70%">

命名规范约定如下：

## 临时分支

- feature：功能开发；
- release：预发布；
- hotfix：修复 bug

命名规范：

- feature 分支命名：feature/name
- release 分支命名：release-name
- hotfix 分支命名：hotfix/name

### Feature 功能

功能分支，它是为了开发某种特定功能，从 Develop 分支上面分出来的。开发完成后，要再并入 Develop。
<img src="http://open.zantop.cn/feature.png" width="60%">

### Release 预发布

Release 分支基于 `Develop` 分支创建，打完 Release 分支之后，我们可以在这个 Release 分支上测试，修改 Bug 等，预发布结束以后，必须合并进 Develop 和 Master 分支。

同时，其它开发人员可以基于 Develop 分支新建 Feature (记住：一旦打了 Release 分支之后不要从 Develop 分支上合并新的改动到 Release 分支)发布 Release 分支时，合并 Release 到 Master 和 Develop， 同时在 Master 分支上打个 Tag 记住 Release 版本号，然后可以删除 Release 分支了。
<img src="http://open.zantop.cn/release.png" width="60%">

### Hotfix 分支

hotfix 分支基于 Master 分支创建，开发完后需要合并回 Master 和 Develop 分支，同时在 Master 上打一个 tag。
<img src="http://open.zantop.cn/hotfix.png" width="60%" >

## 示例

### Develop 开发分支

```shell
# 从仓库 git clone master 分支 创建 develop 分支
git clone ……
# 切换到 develop 分支:
git checkout develop
# 提交本地修改:
git add .
git commit –m “提交日志”
# 推送 develop 分支:
git push origin develop
```

### Feature 功能开发

开始 Feature 进行新功能开发

```shell
# 通过develop新建feaeure分支
git checkout -b feature/wz develop

# 修改md文件
git status
git add .
git commit -m "feature/wz分支"
git push origin feature/wz
```

完成 Feature

```shell
#切换develop分支
git checkout develop
# 拉下最新代码
git pull origin develop
# 合并feature/wz到develop分支
#--no-ff：不使用fast-forward方式合并，保留分支的commit历史
#--squash：使用squash方式合并，把多次分支commit历史压缩为一次
git merge --no-ff feature/wz
# 删除本地址feature/wz分支
git branch -d feature/wz
# 如果需要删除远程feature分支:
git push origin --delete feature/wz
```

### Release 预发布

确认 develop 分支上的功能是否开发完毕,创建 release 发布分支，测试人员可以测试了。

```shell
git checkout -b release-0.1 develop
```

修复测试人员提交发 bug，不允许在该分支提交任何新功能需求。

```shell
# 修复bug
git add .
git commit -m"已解决XXbug"
# 推送release 分支
git  push origin release-0.1
```

测试无任何问题了，将 release 分支合并到 master 和 develop

```shell
git checkout develop
git merge --no-ff release-0.1
git push origin develop

git checkout master
git merge --no-ff release-0.1
git push origin master

#删除分支
git branch -d release-0.1
git push origin -d release-0.1

# 合并master/devlop分支之后，打上tag
git tag -a v0.1.0 master
git push --tags
```

### Hotfix 修复 bug

修复线上 bug

```shell
git checkout -b hotfix-0.1 master
```

完成 bug 修复后提交到 master 和 develop

```shell
git checkout develop
git merge --on-of hotfix-0.1
git push origin develop

git checkout master
git merge --on-of hotfix-0.1
git push origin master

#删除分支
git branch -d hotfix-0.1
git push origin -d hotfix-0.1
# master 上打标签
git tag -a v0.1 master
git push --tags
```

[gitf 分支管理规范](https://juejin.im/post/5d82e1f3e51d4561d044cd88)

## 【commit 规范】

使用过[使用 Angular 的 Commit message 格式](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)

### husky

husky 主用功能是为 git 添加 git 钩子，它允许我们在使用 git 中在一些重要动作发生时触发自定义脚本(npm script), 比如我们可以在 git push 之前执行特定的自定义脚本对代码进行单元测试、又或者在 git commit 之前执行 eslint 校验，当然本文主要介绍如何借用 husky 为 git 添加 commit-msg 钩子并对 commit 进行校验。

```js
npm install husky --save-dev
```

更新 package.json

- 添加 pre-commit 钩子，在 git commit 之前前将会在终端输出 我要提交代码啦
- 添加 commit-msg 钩子，在 git 校验 commit 时会在终端输出 git 所有参数和输入， husky 通过环境变量 HUSKY_GIT_PARAMS - HUSKY_GIT_STDIN 是 husky 返回 git 参数和输入
- 添加 pre-push 钩子， 在 git push 之前将在终端输出 提交代码前需要先进行单元测试 并执行 npm tes

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "echo 我要提交代码啦",
      "commit-msg": "echo $HUSKY_GIT_PARAMS $HUSKY_GIT_STDIN",
      "pre-push": "echo 提交代码前需要先进行单元测试 && npn test"
    }
  }
}
```

### commitlint

commitlint 用于检查您的提交消息是否符合规定提交格式，一般和 husky 包一起使用，用于对 git commit 信息的格式进行校验，当 commit 信息不符合规定格式的情况下将会抛出错误。

**默认格式**

```js
# 注意：冒号前面是需要一个空格的, 带 ？ 表示非必填信息
type(scope?): subject
body?
footer?
```

scope 指 commit 的范围（哪些模块进行了修改）
subject 指 commit 的简短描述
body 指 commit 主体内容（长描述）
footer 指 commit footer 信息
type 指当前 commit 类型，一般有下面几种可选类型：

- feat：新功能（feature）
- fix：修补 bug
- docs：文档修改
- style： 不影响代码含义的修改(例如：white-space; 格式化等)
- refactor：重构（即不是新增功能，也不是修改 bug 的代码变动）
- perf: 提升性能的修改
- test：增加或修改测试
- chore：构建流程或辅助工具的变动
- improvement: 改进
- build: 打包
- ci: 持续集成

**配合 husky 包进行使用**

```js
npm install -D @commitlint/cli @commitlint/config-conventional
```

添加 commitlint 配置文件,根目录新建文件 commitlint.config.js

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert'],
    ],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
  },
};
```

在 package.json 中添加 husky 配置

```json
"husky": {
    "hooks": {
      "commit-msg": "commitlint -e $HUSKY_GIT_PARAMS"
    }
  }
```

这样就配好了，现在我们来测试一下,如果不加前缀会报错

```js
 ~/pro/webpack/webpack-react   feature/husky ✚  git commit -m "修复了新bug""
"
husky > commit-msg (node v10.17.0)
⧗   input: 修复了新bug
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint

husky > commit-msg hook failed (add --no-verify to bypass)
```

修改后`git commit -m "fix: 修复了 也可以直接 commit 会弹出输入界面输入`fix: 修复了新 bug`就 ok。

### commitizen

每次提交 commit 还要手动添加校验信息很繁琐，commitizen 提供了一个交互式的, global 安装，而仅项目本地安装，方便多人开发时，减少其他人的额外操作

```js
yarn add commitizen cz-conventional-changelog -D
```

在 package.json 中添加配置

```
{
  "scripts": {
    "commit": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

官方推荐的是 global 安装 commitizen，然后执行

`commitizen init cz-conventional-changelog --yarn --dev --exact`

去自动添加 cz-conventional-changelog，自动在 package.json 中添加 config 配置，不太推荐这种方式。

```js
> git cz

cz-cli@4.1.2, cz-conventional-changelog@3.2.0

? Select the type of change that you're committing: (Use arrow keys)
❯ feat:     A new feature
  fix:      A bug fix
  docs:     Documentation only changes
  style:    Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  refactor: A code change that neither fixes a bug nor adds a feature
  perf:     A code change that improves performance
  test:     Adding missing tests or correcting existing tests
(Move up and down to reveal more choices)
```

```js
1.Select the type of change that you're committing 选择改动类型 (<type>)
2.What is the scope of this change (e.g. component or file name)? 填写改动范围 (<scope>)
3.Write a short, imperative tense description of the change: 写一个精简的描述 (<subject>)
4.Provide a longer description of the change: (press enter to skip) 对于改动写一段长描述 (<body>)
5.Are there any breaking changes? (y/n) 是破坏性修改吗？默认n (<footer>)
6.Does this change affect any openreve issues? (y/n) 改动修复了哪个问题？默认n (<footer>)
```
[别乱提交代码了，看下大厂 Git 提交规范是怎么做的！](https://blog.csdn.net/youanyyou/article/details/103415164)
### 提交中支持表情符号

借助[gitmoji-cli](https://github.com/carloscuesta/gitmoji-cli)

```js
yarn add gitmoji-cli -D
```

使用方法：在提交时按照约定格式输入表情字符即可（左右两边英文冒号夹着字符，例如 bug ☞ :bug:），提交后会自动被显示，示例：

```js
git commit -m "fix(src): :bug: 修复列表显示问题"
```

如果想要查看所有的表情符号及介绍，可以去[官方文档查阅](https://gitmoji.carloscuesta.me/)，也可以全局安装
`npm i -g gitmoji-cli` 执行 gitmoji -l 命令在终端查看。

### 自动生成 changelog

在使用上文 commit 规范的情况下， 可以通过 standard-version 自动生成 change log，并更新项目的版本信息添加 git tag, change log 中将收录所有 type 为 feat 和 fix 的 commit

```js
npm i --save-dev standard-version
```

npm 脚本命令

```js
{
  "scripts": {
+   "release": "standard-version"
  }
}
```

切换 master 分支`git checkout master`,拉取远程代码`git pull origin master`
首次发布运行`npm run release -- --first-release`生成`CHANGELOG.md`

**-- pre-release, -p 预发版本命令**

使用--prerelease 或者-p 来生成预发布： 假设当前版本是 1.0.0，且将要 commit 的代码为打补丁的修改。运行：

```js
npm run release -p alpha
```

这个 tag 将是 1.0.1-alpha.0

**--release-as, -r 指定版本号**

默认情况下，工具会自动根据 主版本（major）,次版本（ minor） or 修订版（patch） 规则生成版本号，例如如果你 package.json 中的 version 为 1.0.0, 那么执行后版本号则是：1.0.1。自定义可以通过：

```js
npm run release -r 1.0.1
```

将生成版本号 1.1.0,而不是自动生成的版本号 1.0.1

更新本地 tag 到远程分支

```js
git push --follow-tags origin master
```

自定义头部 CAGNGELOG.md 根目录创建`.versionrc`

```json
{
  "header": "This header is not used"
}
```

[git 工作流和 git commit 规范](https://juejin.im/post/5d05ef596fb9a07ef63fdbe7#heading-4)  
[git commit 规范校验配置和版本发布配置](https://juejin.im/post/5cf150f1f265da1b7c60ffe3#heading-0)

## git 命令

### 关联远程分支

```shell
git remote add origin 远程仓库地址
```
### 设置远程分支

```shell
git push --set-upstream origin develop
git push -u origin develop
```

### 查看分支
```shell
# 查看本地分支
git branch
# 查看远程分支
git branch -r
# 查看所有分支
git branch -a
```
### 删除远程分支
```shell
git push origin -d 分支
```
### 拉取指定分支代码
```shell
git clone -b dev_jk http://aaa/bbb.git
```

### 查看远程分支
```shell
git remote -v 

```
### 查看日志

```shell
# 显示所有提交过的版本信息
git log
# 只显示版本号和提交时的备注信息
git log --pretty=oneline
# 显示短版本号
git log --oneline
# 查看所有分支的所有操作记录（包括已经被删除的 commit 记录和 reset 的操作）
git reflog
```

### 撤销操作

**工作区**

```shell
# 撤销单个文件更改
git checkout 文件名
# 撤销所有操作
git checkout .
```

**暂存区与版本库HEAD区**

git reset 会撤掉改commit_id之后所有版本
```shell
# 使用reset默认的--fixed参数，假装回退到当前版本，撤销add
git reset HEAD

# reset 有三个参数
--fixed 					# 默认，不删除工作空间改动代码，撤销commit，撤销add
--soft						# 不删除工作空间改动代码，撤销commit，不撤销add
--hard						# 删除工作空间改动代码，撤销commit，不撤销add

# 也撤销指定文件的add
git reset HEAD fileName.txt
# 退回到某次commit
git reset --hard HEAD^         # 回退到上个版本
git reset --hard HEAD~3        # 回退到前3次提交之前，以此类推，回退到n次提交之前
git reset --hard commit_id     # 退到/进到 指定commit的sha码

# 需要强制提交
git push -f
```
git revert 撤销某个版本的提交

```shell
# 撤销<commit-hash>这个版本的操作
git revert [-n] <commit-hash>
# 默认需要立刻commit，可以添加-n或--no-commit参数推迟commit
# 接下来直接commit、push即可，会在log中追加新的commit记录

# 连续多个revert
git revert -n <commit-hash_start>..<commit-hash_end>
	# 会撤销（ commit-hash_start, commit-hash_end ] 的提交
```

```shell
# 撤销该提交
git revert -n e0e19f0079e1e1b1d26262bbe3ea2530a701592d   
# 在commit下生成个新版本
git commit -m "提交代码新"
```
[git恢复之前版本的两种方法reset、revert](https://blog.csdn.net/yxlshk/article/details/79944535)

[git详解](https://juejin.im/post/6844904121133170696)  

[「一劳永逸」一张脑图带你掌握Git命令](https://juejin.im/post/6869519303864123399)

![](http://open.zantop.cn/git%E5%91%BD%E4%BB%A4.png)
