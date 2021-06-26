# node 搭建 cli

![](http://open.zantop.cn/nodecli.png)

## 1、准备工作

新建项目目录`mkdir demo-cli`,并使用`npm init` 进行初始化，创建`bin/index.js`文件。

在`package.json`加入如下命令：

```json
{
  "bin": {
    "demo": "./bin/index.js"
  }
}
```

在你使用 demo 命令的时候，会去执行 bin 文档夹 下的 index.js

```js
#!/usr/bin/env node

console.log('hello CLI');
```

注意： 一定要在开头加上`#!/usr/bin/env node`，告诉操作系统用 Node 来运行此文档,否则无法运行。  
执行`npm link`，该命令主要做两件事情:

- 一是为 npm 包目录创建软链接，将其链到 `{prefix}/lib/node_modules/<package>`
- 二为可执行文档(bin)创建软链接，将其链到 `{prefix}/bin/{name}`

将 npm 包链接到全局执行环境,从而在任意位置使用命令行都可以直接运行.

```js
/usr/local/bin/demo -> /usr/local/lib/node_modules/demo-cli/bin/index.js
/usr/local/lib/node_modules/demo-cli -> /Users/wangzan/pro/demo-cli
```

在项目目录下执行`demo`，会打印出`hello CLI`.

## 2、解析命令参数

[commander.js](https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md)，可以自动的解析命令和参数，用于处理用户输入的命令。

安装`npm i commander -S`

index.js 定义 init 命令：

```js
#!/usr/bin/env node
const program = require('commander');

program
  .version('1.0.0', '-v, --version')
  .command('init <name>')
  .action((name) => {
    console.log(name);
  });
program.parse(process.argv);
```

调用 `version('1.0.0', '-v, --version')`会将 -v 和 --version 添加到命令中，可以通过这些选项打印出版本号。  
调用 `command('init <name>')`定义 init 命令，name 则是必传的参数，为项目名。  
`action()` 则是执行 init 命令会发生的行为，要生成项目的过程就是在这里面执行的，这里暂时只打印出 name。  
其实到这里，已经可以执行 init 命令了。我们来测试一下，在 demo-cli 的同级目录下执行：
`demo init HelloWorld`

可以看到命令行工具也打印出了 HelloWorld，那么很清楚， `action((name) => {})`这里的参数 name，就是我们执行 init 命令时输入的项目名称。

命令已经完成，接下来就要下载模板生成项目结构了。

## 3、下载模板

[download-git-repo](https://www.npmjs.com/package/download-git-repo),支持从 Github、Gitlab 和 Bitbucket 下载仓库，各自的具体用法可以参考官方文档。

```js
#!/usr/bin/env node
const program = require('commander');
const download = require('download-git-repo');

program
  .version('1.0.0', '-v, --version')
  .command('init <name>')
  .action((name) => {
    download(
      'https://github.com:zantop/vue-ssr-demo',
      name,
      { clone: true },
      (err) => {
        console.log(err ? 'Error' : 'Success');
      },
    );
  });
program.parse(process.argv);
```

download() 第一个参数就是仓库地址,注意格式`仓库域名：用户名/仓库名` ，第二个参数是 clone 到的文件夹的名字。

`demo init vue-ssr`

会看到 demo 目录下，远程仓库`vue-ssr-demo`会下载到文件夹`vue-ssr`下。

## 4、命令行交互

[inquirer.js](https://github.com/SBoudrias/Inquirer.js)命令行交互功能可以在用户执行 init 命令后，向用户提出问题，接收用户的输入并作出相应的处理。这里使用 来实现。

```js
#!/usr/bin/env node
const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
program
  .version('1.0.0', '-v, --version')
  .command('init <name>')
  .action((name) => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'author',
          message: '请输入作者名称',
        },
      ])
      .then((answers) => {
        console.log(answers.author);
      });
  });
program.parse(process.argv);
```

问题就放在 prompt() 中，问题的类型为 input 就是输入类型，name 就是作为答案对象中的 key，message 就是问题了，用户输入的答案就在 answers 中，使用起来就是这么简单。  
[inquirer.js —— 一个用户与命令行交互的工具](https://blog.csdn.net/qq_26733915/article/details/80461257)

## 5、修改 package.json

```js
#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const chalk = require('chalk');
const symbols = require('log-symbols');
program
  .version('1.0.0', '-v, --version')
  .command('init')
  .action((name) => {
    inquirer
      .prompt([
        {
          name: 'name',
          type: 'input',
          message: '项目名称',
          validate: (value) => {
            if (value === '') {
              console.log(symbols.error, chalk.red('请输入项目名称'));
              return false;
            }
            if (fs.existsSync(value)) {
              // 错误提示项目已存在，避免覆盖原有项目
              console.log(symbols.error, chalk.red('项目已存在'));
              return false;
            }
            return true;
          },
        },
        {
          name: 'version',
          type: 'input',
          message: '项目版本号',
        },
        {
          name: 'description',
          type: 'input',
          message: '项目描述',
        },
        {
          name: 'author',
          type: 'input',
          message: '开发者',
        },
        {
          name: 'template',
          type: 'list',
          message: '选择模板类型',
          choices: ['Vue', 'React'],
        },
      ])
      .then((answers) => {
        fs.mkdirSync(answers.name);
        download(
          'https://github.com:zantop/react-cnode',
          answers.name,
          { clone: true },
          (err) => {
            console.log(err ? 'Error' : 'Success');
            const fileName = `${answers.name}/package.json`;
            const content = JSON.parse(fs.readFileSync(fileName).toString());
            content.name = answers.name;
            content.version = answers.version;
            content.author = answers.author;
            content.description = answers.description;
            fs.writeFileSync(
              fileName,
              JSON.stringify(content, null, '\t'),
              'utf-8',
            );
          },
        );
      });
  });
program.parse(process.argv);
```

## 6、美化输出

[log-symbols](https://github.com/sindresorhus/log-symbols)，可以在终端上显示出 √ 或 × 等的图标。  
[chalk](https://github.com/chalk/chalk)，可以给终端的字体加上颜色。  
[ora](https://github.com/sindresorhus/ora)，下载过程久的话，可以用于显示下载中的动画效果。

在用户输入答案之后，开始下载模板，这时候使用 ora 来提示用户正在下载中。

```js
const ora = require('ora');
// 开始下载
const spinner = ora('正在下载模板...');
spinner.start();

// 下载失败调用
spinner.fail();

// 下载成功调用
spinner.succeed();
```

然后通过 chalk 来为打印信息加上样式，比如成功信息为绿色，失败信息为红色，这样子会让用户更加容易分辨，同时也让终端的显示更加的好看。

```js
const chalk = require('chalk');
console.log(chalk.green('项目创建成功'));
console.log(chalk.red('项目创建失败'));
```

除了给打印信息加上颜色之外，还可以使用 log-symbols 在信息前面加上 √ 或 × 等的图标

```js
const chalk = require('chalk');
const symbols = require('log-symbols');
console.log(symbols.success, chalk.green('项目创建成功'));
console.log(symbols.error, chalk.red('项目创建失败'));
```

新建`template.json`,选择不同的模板的时候，从不同的仓库下载。
完整示例：

```js
#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const symbols = require('log-symbols');
const template = require('../template.json');

program
  .version('1.0.0', '-v, --version')
  .command('init')
  .action((name) => {
    inquirer
      .prompt([
        {
          name: 'name',
          type: 'input',
          message: '项目名称',
          validate: (value) => {
            if (value === '') {
              console.log(symbols.error, chalk.red('请输入项目名称'));
              return false;
            }
            if (fs.existsSync(value)) {
              // 错误提示项目已存在，避免覆盖原有项目
              console.log(symbols.error, chalk.red('项目已存在'));
              return false;
            }
            return true;
          },
        },
        {
          name: 'version',
          type: 'input',
          message: '项目版本号',
        },
        {
          name: 'description',
          type: 'input',
          message: '项目描述',
        },
        {
          name: 'author',
          type: 'input',
          message: '开发者',
        },
        {
          name: 'template',
          type: 'list',
          message: '选择模板类型',
          choices: ['vue', 'react'],
        },
      ])
      .then((answers) => {
        console.log(template[answers.template]);
        fs.mkdirSync(answers.name);
        const spinner = ora('正在下载模板...');
        spinner.start();
        download(
          template[answers.template],
          answers.name,
          { clone: true },
          (err) => {
            if (!err) {
              spinner.succeed();
              const fileName = `${answers.name}/package.json`;
              const content = JSON.parse(fs.readFileSync(fileName).toString());
              content.name = answers.name;
              content.version = answers.version;
              content.author = answers.author;
              content.description = answers.description;
              fs.writeFileSync(
                fileName,
                JSON.stringify(content, null, '\t'),
                'utf-8',
              );
              console.log(
                symbols.success,
                chalk.green(
                  `🤪 项目初始化完成！\ncd ${answers.name}\nnpm install\nnpm run dev\n`,
                ),
              );
            } else {
              spinner.fail();
              console.log(symbols.error, chalk.red('🥺 模板下载失败！'));
            }
          },
        );
      });
  });
program.parse(process.argv);
```

## 7、发布到 npm

坑,切换 npm 源

```js
npm config set registry http://registry.npmjs.org
```

发包 npm publish 失败:  
解决方案：`npm publish --access public`

[一分钟教你发布 npm 包](https://www.jianshu.com/p/7bba18925fbf)

[Commander.js 中文文档](http://www.cnblogs.com/mirandachen/p/9826886.html)  
[记一次 nodejs 开发 CLI 的过程](https://juejin.im/post/5a90dd62f265da4e9a4973aa)  
[基于 node.js 的脚手架工具开发经历](https://juejin.im/post/5a31d210f265da431a43330e)  
[使用 Node.js 开发简单的脚手架工具](https://github.com/lin-xin/blog/issues/27)  
[手把手教你如何使用 nodejs 编写 cli 命令行](https://www.jb51.net/article/150196.htm)
