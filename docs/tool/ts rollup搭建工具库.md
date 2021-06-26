# ts rollup 搭建工具库

## 需求

**需求**

- 支持编辑器的快速补全和提示
- 自动化构建
- 支持自动生成 changlog
- 代码通过 lint 和测试后才能提交、发布

**涉及的库**

- eslint + @typescript-eslint/parser
- rollup
- jest
- @microsoft/api-extractor
- gulp

## 初始化项目

`npm init -y`

安装 ts `yarn add typescript -D` 创建目录`src`配置`tsconfig.json`

配置`.editorconfig`编辑规范

```js
.
├── package.json
├── src
│   └── index.ts
├── tsconfig.json
└── yarn.lock
```

## 配置 eslint

TypeScirpt 已经全面采用 ESLint 作为代码检查[The future of TypeScript on ESLint](https://eslint.org/blog/2019/01/future-typescript-eslint)
并且提供了 TypeScript 文件的解析器 [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser)和配置选项 [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin)

**安装**

```js
yarn add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

配置`tsconfig.eslint.json`

```js
/* tsconfig.eslint.json */
{
  "compilerOptions": {
    "baseUrl": ".",
    "resolveJsonModule": true,
  },
  "include": [
    "**/*.ts",
    "**/*.js"
  ]
}
```

配置`.eslintrc.js`

```js
// .eslintrc.js
const eslintrc = {
  parser: '@typescript-eslint/parser', // 使用 ts 解析器
  extends: [
    'eslint:recommended', // eslint 推荐规则
    'plugin:@typescript-eslint/recommended', // ts 推荐规则
  ],
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  rules: {}, // 自定义
};

module.exports = eslintrc;
```

## 配置 [rollup](https://www.rollupjs.com/)

配置安装相关库

```js
yarn add -D rollup rollup-plugin-babel rollup-plugin-commonjs rollup-plugin-eslint rollup-plugin-node-resolve rollup-plugin-typescript2
```

安装 babel 相关库

```js
yarn add -D @babel/preset-env @babel/core
```

配置.babelrc

```js
/* .babelrc */
{
  "presets": [
    [
      "@babel/preset-env",
      {
        /* Babel 会在 Rollup 有机会做处理之前，将我们的模块转成 CommonJS，导致 Rollup 的一些处理失败 */
        "modules": false
      }
    ]
  ]
}
```

配置 rollup.config.ts

```js
import path from 'path';
import { RollupOptions } from 'rollup';
import rollupTypescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import { DEFAULT_EXTENSIONS } from '@babel/core';

import pkg from './package.json';

const paths = {
  input: path.join(__dirname, '/src/index.ts'),
  output: path.join(__dirname, '/dist'),
};

// rollup 配置项
const rollupConfig: RollupOptions = {
  input: paths.input,
  output: [
    // 输出 commonjs 规范的代码
    {
      file: path.join(paths.output, 'index.js'),
      format: 'cjs',
      name: pkg.name,
    },
    // 输出 es 规范的代码
    {
      file: path.join(paths.output, 'index.esm.js'),
      format: 'es',
      name: pkg.name,
    },
  ],
  // external: ['lodash'], // 指出应将哪些模块视为外部模块，如 Peer dependencies 中的依赖
  // plugins 需要注意引用顺序
  plugins: [
    // 验证导入的文件
    eslint({
      throwOnError: true, // lint 结果有错误将会抛出异常
      throwOnWarning: true,
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**', 'dist/**', '*.js'],
    }),

    // 使得 rollup 支持 commonjs 规范，识别 commonjs 规范的依赖
    commonjs(),

    // 配合 commnjs 解析第三方模块
    resolve({
      // 将自定义选项传递给解析插件
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    rollupTypescript(),
    babel({
      runtimeHelpers: true,
      // 只转换源代码，不运行外部依赖
      exclude: 'node_modules/**',
      // babel 默认不支持 ts 需要手动添加
      extensions: [...DEFAULT_EXTENSIONS, '.ts'],
    }),
  ],
};

export default rollupConfig;
```

注意：

- plugins 必须有顺序的使用
- external 来设置三方库为外部模块，否则也会被打包进去，变得非常大哦

配置声明文件

```js
declare module 'rollup-plugin-babel'
declare module 'rollup-plugin-eslint'
```

由于部分插件还没有 @types 库，所以我们手动添加声明文件

试一下  
我们在 index.ts 文件下，随意加入一个方法

```js
export default function myFirstFunc(str: string) {
  return `hello ${str}`;
}
```

就生成了 index.js 和 index.esm.js 文件。分别对应着 commonjs 规范和 es 规范的文件。rollup 可是大力推行 es 规范啊，然后我们很多三方库都仍旧使用 commonjs 规范，为了兼容，我们两种规范都生成。
由于使用了 ts ，可以很方便的实现快速补全的需求，按照上面的例子，项目中使用这个包后，vscode 上输入就会有提示。

## 配置 jest

```js
yarn add -D @types/jest eslint-plugin-jest jest ts-jest assert
```

目录

```js
.
├── dist
│   ├── index.d.ts
│   ├── index.esm.js
│   └── index.js
├── package.json
├── rollup.config.ts
├── src
│   └── index.ts
├── test
│   └── index.test.js
├── tsconfig.eslint.json
├── tsconfig.json
└── yarn.lock
```

配置 jest.config.js

```js
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

写个测试

```js
// index.test.ts

import assert from 'assert';
import myFirstFunc from '../src';

describe('validate:', () => {
  /**
   * myFirstFunc
   */
  describe('myFirstFunc', () => {
    test(' return hello rollup ', () => {
      assert.strictEqual(myFirstFunc('rollup'), 'hello rollup');
    });
  });
});
```

配置 eslint

```js
const eslintrc = {
  // ...
  extends: [
    // ...
    'plugin:jest/recommended',
  ],
  plugins: [
    // ...
    'jest',
  ],
  // ...
};
```

增加 package.json scripts

```js
"test": "jest --coverage --verbose -u"
```

- coverage 输出测试覆盖率
- verbose 层次显示测试套件中每个测试的结果，会看着更加直观啦

## 配置 @microsoft/api-extractor

当我们 src 下有多个文件时，打包后会生成多个声明文件。

使用 `@microsoft/api-extractor` 这个库是为了把所有的`.d.ts` 合成一个，并且，还是可以根据写的注释自动生成文档。

配置 api-extractor.json

```js
/* api-extractor.json */
{
  "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
  "mainEntryPointFilePath": "./lib/index.d.ts",
  "bundledPackages": [ ],
  "dtsRollup": {
    "enabled": true,
    "untrimmedFilePath": "./lib/index.d.ts"
  }
}
```

增加 `package.json scripts`

```js
"api": "api-extractor run",
```

你可以尝试多写几个方法，打包后会发现有多个 .d.ts 文件，然后执行 yarn api

加入 ts doc 风格注释

````js
/**
 * 返回 hello 开头的字符串
 * @param str - input string
 * @returns 'hello xxx'
 * @example
 * ```ts
 * myFirstFunc('ts') => 'hello ts'
 * ```
 *
 * @beta
 * @author ziming
 */
````

在使用的该方法的时候就会有提示啦
这里我已经增加了两个方法，请看 下面的 commit
执行后，会发现 声明都合在 index.d.ts 上啦。然后要把多余的给删除掉，后面改成自动删除它 😕
😤 还有一个 temp 文件夹，咱们配置一下 gitignore 不然它提交。tsdoc-metadata.json 可以暂时不管它，可以删除掉。
后面配置 package.json 的 typing 会自动更改存放位置

## gulp 自动化构建

安装

```js
yarn add -D gulp @types/gulp fs-extra @types/fs-extra @types/node ts-node chalk
```

配置 package.json

```js
  "main": "lib/index.js",
  "module": "lib/index.esm.js",
  "typings": "lib/index.d.js",

  "scripts": {
      /* ... */
      "build": "gulp build",
  }
```

配置 gulpfile

我们思考一下构建流程 🤔

1. 删除 lib 文件
2. 呼叫 Rollup 打包
3. api-extractor 生成统一的声明文件，然后 删除多余的声明文件

```js
// 删除 lib 文件
const clearLibFile: TaskFunc = async (cb) => {
  fse.removeSync(paths.lib);
  log.progress('Deleted lib file');
  cb();
};
// rollup 打包
const buildByRollup: TaskFunc = async (cb) => {
  const inputOptions = {
    input: rollupConfig.input,
    external: rollupConfig.external,
    plugins: rollupConfig.plugins,
  };
  const outOptions = rollupConfig.output;
  const bundle = await rollup(inputOptions);

  // 写入需要遍历输出配置
  if (Array.isArray(outOptions)) {
    outOptions.forEach(async (outOption) => {
      await bundle.write(outOption);
    });
    cb();
    log.progress('Rollup built successfully');
  }
};
// api-extractor 整理 .d.ts 文件
const apiExtractorGenerate: TaskFunc = async (cb) => {
  const apiExtractorJsonPath: string = path.join(
    __dirname,
    './api-extractor.json',
  );
  // 加载并解析 api-extractor.json 文件
  const extractorConfig: ExtractorConfig = await ExtractorConfig.loadFileAndPrepare(
    apiExtractorJsonPath,
  );
  // 判断是否存在 index.d.ts 文件，这里必须异步先访问一边，不然后面找不到会报错
  const isExist: boolean = await fse.pathExists(
    extractorConfig.mainEntryPointFilePath,
  );

  if (!isExist) {
    log.error('API Extractor not find index.d.ts');
    return;
  }

  // 调用 API
  const extractorResult: ExtractorResult = await Extractor.invoke(
    extractorConfig,
    {
      localBuild: true,
      // 在输出中显示信息
      showVerboseMessages: true,
    },
  );

  if (extractorResult.succeeded) {
    // 删除多余的 .d.ts 文件
    const libFiles: string[] = await fse.readdir(paths.lib);
    libFiles.forEach(async (file) => {
      if (file.endsWith('.d.ts') && !file.includes('index')) {
        await fse.remove(path.join(paths.lib, file));
      }
    });
    log.progress('API Extractor completed successfully');
    cb();
  } else {
    log.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    );
  }
};
// 完成
const complete: TaskFunc = (cb) => {
  log.progress('---- end ----');
  cb();
};
```

然后用一个 build 方法，将他们按顺序合起来

```js
export const build = series(
  clearLibFile,
  buildByRollup,
  apiExtractorGenerate,
  complete,
);
```

尝试下`yarn build`

## changelog 自动生成

[git 提交规范](https://blog.zantop.cn/tool/git%E6%8F%90%E4%BA%A4%E8%A7%84%E8%8C%83)

## 优化开发流程

安装

```js
yarn add -D husky lint-staged

  "husky": {
    "hooks": {
      "pre-commit": "lint-staged & jest -u"
    }
  },
  "lint-staged": {
    "*.{.ts,.js}": [
      "eslint",
      "git add"
    ]
  }

```

之后提交代码都会先 lint 验证，再 jest 测试通过，才可以提交。规范团队协作的代码规范

## 优化发布流程

```js
//package.json
/* pushlish 的文件 */
"files": [
    "lib",
    "LICENSE",
    "CHANGELOG.md",
    "README.md"
],
/* 使得支持 tree shaking */
"sideEffects": "false",
"script": {
    /* ... */
    "changelog": "gulp changelog",
    "prepublishOnly": "yarn lint & yarn test & yarn changelog & yarn build"
}

```

prepublishOnly 可以在 publish 的时候，先 lint 验证， 再 jest 测试 ， 再生成 changlog ，最后打包，最后发布。

至此，我们已经实现了全部需求
