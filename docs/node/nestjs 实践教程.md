# nestjs入门实践

## 安装

全局安装
```js
 npm i -g @nestjs/cli
 ```
 创建项目
 ```js
 nest new nestdemo
 ```
项目目录
 ```js
├── app.controller.spec.ts   // 处理请求和响应单元测试
├── app.controller.ts        // 处理请求和响应
├── app.module.ts            // 模块链接controller和service
├── app.service.ts           // 跟数据库操作
└── main.ts                  // 主入口，NestFactory 用来创建 Nest 应用实例
```
## 运行

运行`yarn start`，可以在postman中`http://127.0.0.1:3000`看到响应为`hello word`

## 模块
NestJs的项目结构是由`Controller`、`Service`、`Module`三个主要部分组成的，它们共同组成一个模块。
- Controller: 控制器，通过@Controller()装饰器定义的类，目的是接收应用的特定请求。路由机制控制哪个控制器接收哪些请求。通常，每个控制器有多个路由，不同的路由可以执行不同的操作。它的功能类似Spring，主要就是为前端提供api接口，以及一些简单的验证。
- Service: 提供者，又称为Provider，通过@Injectable()装饰器定义的类，功能也类似Spring的服务层，主要负责处理具体的业务，逻辑代码一般都写在这里。
- Module: 模块，通过@Module()装饰器定义的类，这里和Spring有区别，它的作用主要是负责连接Controller和Service，有些类似namespace。

## 命令
```ts
sage: nest <command> [options]

Options:
  -v, --version                                   Output the current version.
  -h, --help                                      Output usage information.

Commands:
  new|n [options] [name]                          Generate Nest application.
  build [options] [app]                           Build Nest application.
  start [options] [app]                           Run Nest application.
  info|i                                          Display Nest project details.
  update|u [options]                              Update Nest dependencies.
  add [options] <library>                         Adds support for an external library to your project.
  generate|g [options] <schematic> [name] [path]  Generate a Nest element.
    Available schematics:
      ┌───────────────┬─────────────┬──────────────────────────────────────────────┐
      │ name  应用名   │ alias别名    │ description       描述                       │
      │ application   │ application │ Generate a new application workspace         │
      │ class         │ cl          │ Generate a new class                         │
      │ configuration │ config      │ Generate a CLI configuration file            │
      │ controller    │ co          │ Generate a controller declaration            │
      │ decorator     │ d           │ Generate a custom decorator                  │
      │ filter        │ f           │ Generate a filter declaration                │
      │ gateway       │ ga          │ Generate a gateway declaration               │
      │ guard         │ gu          │ Generate a guard declaration                 │
      │ interceptor   │ in          │ Generate an interceptor declaration          │
      │ interface     │ interface   │ Generate an interface                        │
      │ middleware    │ mi          │ Generate a middleware declaration            │
      │ module        │ mo          │ Generate a module declaration                │
      │ pipe          │ pi          │ Generate a pipe declaration                  │
      │ provider      │ pr          │ Generate a provider declaration              │
      │ resolver      │ r           │ Generate a GraphQL resolver declaration      │
      │ service       │ s           │ Generate a service declaration               │
      │ library       │ lib         │ Generate a new library within a monorepo     │
      │ sub-app       │ app         │ Generate a new application within a monorepo │
      │ resource      │ res         │ Generate a new CRUD resource

```
**文件命名**
- *.middleware.ts  中间件
- *.controller.ts 控制器
- *.decorator.ts 自定义装饰器
- *.entity.ts 数据对象实例（typeorm）
- *.interface.ts 接口
- *.module.ts NEST模块
- *.service.ts NEST服务对象
- *.pipe.ts  NEST管道对象
- *.dto.ts 数据传输对象
- *.spec.ts 单元测试文件

生成文件
```ts
 nest g service auth/auth 
 // 不生成测试文件
 nest g service auth/auth  --no-spec
 ```

## 控制器

**Controller** **负责接收请求，返回响应。**

`@Controller()`装饰一个类。


### 路由

- `@Controller()`加入路由前缀如：`@Controller('user')` `http://127.0.0.1:3000/user`

- `@Get('v1')`路由为`http://127.0.0.1:3000/user/v1`
-  全局路由前缀 `main.ts` 中加上`app.setGlobalPrefix('api')`,路由为`http://127.0.0.1:3000/api/user/v1`
  
```js
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // 全局路由前缀
  await app.listen(3000);
}
bootstrap();
```
- 路由通配符：`@Get('ab*cd')` 路由`http://127.0.0.1:3000/api/user/abnotcd`都可匹配到，正则匹配[path-to-regexp](https://github.com/pillarjs/path-to-regexp)
- 路由参数：`@Get(':id')`路由`http://127.0.0.1:3000/api/user/123`
### 请求参数

 除了 `@Get()`  `@Post()` Nest 为所有标准的 HTTP 方法提供了相应的装饰器：`@Put()`、`@Delete()`、`@Patch()`、`@Options()`、以及 `@Head()`。此外，`@All()` 则用于定义一个用于处理所有 HTTP 请求方法的处理程序。

Nest有4种定义参数的装饰器`@Body()`` @Param()` `@Query()` `@HostParam()` ，与Express的机制一样，见下表：


![](https://img-blog.csdnimg.cn/20191206163910237.png)
示例：

**@Param**
```js
// http://127.0.0.1:3000/api/user/123
@Controller('user')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get(":id")
  // getHello(@Param() {id}): string { 可直接解构
  getHello(@Param() params): string {
    console.log(params); //{ id: '123' }
    return this.appService.getHello();
  }
}
// http://127.0.0.1:3000/api/user/test
@Get(":params")
  getHello(@Param('params') params): string {
    console.log(params); //test
    return this.appService.getHello();
}

```
 **@Query** 
 ```js
// http://127.0.0.1:3000/api/user?id=123
@Controller('user')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(@Query() query): string {
    console.log(query);//{ id: '123' }
    return this.appService.getHello();
  }
}
//也可以传值打印出来就是id的值
 getHello(@Query("id") id): string {
    console.log(id));//123
    return this.appService.getHello();
  }
```
**@Body @Headers** 

```js
// http://127.0.0.1:3000/api/user
@Controller('user')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(@Body() body,@Headers() header): string {
    console.log(body,header);
    return this.appService.getHello();
  }
}
{ name: 123 } {
  'content-type': 'application/json',
  'user-agent': 'PostmanRuntime/7.28.0',
  accept: '*/*',
  'cache-control': 'no-cache',
  'postman-token': '083ea3c1-9604-4bd8-aa99-31def08afb47',
  host: '127.0.0.1:3000',
  'accept-encoding': 'gzip, deflate, br',
  connection: 'keep-alive',
  'content-length': '12',
  cookie: 'csrfToken=5vJ8HPpNQZmycqSmzN1JzyuJ'
}
```
也可以使用`@Request()/@Req()` `@Response()/@Res()*`
```js
getHello(@Req() req): string {
    console.log(req.params);
    console.log(req.body);
    return this.appService.getHello();
  }
```
### 状态码

```js
@Get()
  //设置http状态码
  @HttpCode(204)
  getHello(@Query() query,  ): string {
    console.log(query);
    return this.appService.getHello();
  }
```
### Headers

```js
  @Get()
  @HttpCode(204)
  // 设置响应头
  @Header('Cache-Control', 'none')
  getHello(@Query() query,  ): string {
    console.log(query);
    return this.appService.getHello();
  }
```
### 重定向

@Redirect() 带有必需的 url参数和可选的 statusCode参数。 如果省略，则 statusCode 默认为 302

`@Redirect(url?: string, statusCode?: number)`
```js
  @Get()
  // 重定向到https://nestjs.com
  @Redirect('https://nestjs.com',301)
  getHello(@Query() query,  ): string {
    console.log(query);
    return this.appService.getHello();
  }
```
### 异步
async await

每个异步函数都必须返回一个Promise。这意味着您可以返回Nest能够自行解决的延迟值。
```js
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```
### DTO

拿到请求参数后，我们经常需要做一些操作，比如存储数据库等，那么这样的数据需要经过校验、转换的环节，如何更加规范地定义和使用这种传输中的数据，Nest推荐声明DTO：

DTO(Data Transfer Object)这个概念实际上体现的是分层设计架构，最早应用于J2EE企业级架构解决方案，数据库中的数据和视图层所需要的数据是有差异的，在各层之间需要转换传输的对象抽象为DTO。


在Nest中，我们可以使用Class来定义DTO，当然使用interface也是可以的，不过Class的方式更有助后续结合Pipe可以在DTO上做更多事情（如校验等），也可以让Nest在运行态感知DTO的存在。

```js
// app.dto.ts
export class CreateUserDto{
  name:string;
  age:number;
  grade:string
}
// app.controller.ts
  @Post()
  async create(@Body() createUserDto:CreateUserDto){
    console.log(createUserDto);
    return "创建成功！"
  }
```
## 提供者

![](https://raw.githubusercontent.com/easterCat/img-package/master/img/Components_1.png)
**什么是 Provider?**

**Provider**不止Service（helper、factory、repository等都可以是 Provider

控制器应处理 HTTP 请求并将更复杂的任务委托给Provider。Provider是纯粹的 JavaScript 类，在其类声明之前带有 @Injectable()装饰器。

不论从哪个方向去理解，总之就是将各种逻辑业务封装在其中，统一暴露给控制器来执行。这样做法的好处是：做业务的关心业务本身就可以了，其他例如：身份验证、参数检验，都不用去考虑，交给中间件就好。

### 创建service服务
```js
// cat.service.ts
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```
在该示例中，定义了一个非常简单的Provider，实际上是一个Nest.js的Service，可被依赖注入到其他模块（如Controller）中使用。

### Controller中使用
```js
//cat.controller
import { Controller, Get, Post, Body } from "@nestjs/common";
import { CreateCatDto } from "./dto/create-cat.dto";
import { CatsService } from "./cat.service";
import { Cat } from "./interfaces/cat.interface";
@Controller("cats")
export class CatsController {
  constructor(private catsService: CatsService) {}
  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```
可以看到，catsService在contructor中被依赖注入，直接通过参数可以拿到Service的实例。

补充一点，在Constructor里使用访问修饰符定义入参，实际上在TypeScript是一种简化写法，等价于：
```js
constructor(catsService: CatsService) {
    this.catsService = catsService;
}
// 简化
constructor(private catsService: CatsService) {}
```
### 注册到模块

此时将用到CatService的模块倒入CatModule就可以使用CatService了。

```js
// cat.module.ts
import { Module } from "@nestjs/common";
import { CatController } from "./cat.controller";
import { CatService } from "./cat.service";
@Module({
  controllers: [CatController],
  providers: [CatService],
})
export class CatModule {}
```
## 模块
模块**Module**是具有 @Module() 装饰器的类。 @Module() 装饰器提供了元数据，Nest 用它来组织应用程序结构。
![](https://docs.nestjs.com/assets/Modules_1.png)

- providers	由 Nest 注入器实例化的提供者，并且可以至少在整个模块中共享
- controllers	必须创建的一组控制器
- imports	如果要使用其他模块的 providers，需要将其他模块加入到 imports 中来
- exports	导出自己的 provider，可供其他模块使用

### 根模块

每个应用都需要有一个入口模块，即根模块（Root Module），在Nest.js启动后，会根据当前的根模块构建一个有向图，查找依赖关系，逐层执行。

### 功能模块

上面已经注册功能模块`cat.module.ts`了，运行起来，需要让改模块注册到根模块`app.module.ts`。

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {CatModule} from "./cat/cat.module"
@Module({
  imports: [CatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
### 共享模块

每个模块都是可共享的，如上面的`cat.module.ts`中可导出`CatService`
```ts
// cat.module.ts
import { Module } from "@nestjs/common";
import { CatController } from "./cat.controller";
import { CatService } from "./cat.service";
@Module({
  controllers: [CatController],
  providers: [CatService], 
  exports: [CatService], 
})
export class CatModule {}
```
现在，每个导入 CatModule 的模块都可以访问 CatService ，并且它们将共享相同的 CatService 实例。

例如：有两个含有不同功能的两个模块：`ModuleA`和`ModuleB`，现在在许多其他功能的模块中，需要同时用到`ModuleA`和`ModuleB`，这个时候，就可以将`ModuleA`和`ModuleB`汇总到一个共享模块(`shareModule`)中，然后在这个共享模块中将ModuleA和ModuleB导出，然后在其他功能模块中，倒入`shareModule`就可以使用`ModuleA`和`ModuleB`的`providers`。
```js
import { Module } from '@nestjs/common';
import { ModuleA } from './ModuleA';
import { ModuleB } from './ModuleB';

@Module({
  imports: [ModuleA,ModuleB],
  exports: [ModuleA,ModuleB],
})
export class ShareModule {
}
```
当然，上面的这个ShareModule如果想在整个应用程序中使用，那就将这个ShareModule设置为全局模块就可以了

### 全局模块

@Global 装饰器，@Global 装饰器使模块成为全局作用域。全局模块应该只注册一次，最好由根(AppModule)或核心模块注册。
注意： 将一切模块全局化处理，并不是一个很好的解决方案。全局模块可用于减少必要模板文件的数量。但是imports 数组仍然是使模块 API 透明的最佳实践方式。
```ts
import { Module } from '@nestjs/common';
import { ModuleA } from './ModuleA';
import { ModuleB } from './ModuleB';
@Global
@Module({
  imports: [ModuleA,ModuleB],
  exports: [ModuleA,ModuleB],
})
export class ShareModule {
}
```

## 中间件

中间件**Middleware**实际上是在请求到达路由方法之前的执行函数，它可以获取到request及response的上下文，以及next()方法调用下一个中间件。

Nest.js默认情况下和express的中间件是保持一致的机制

您可以在函数中或在具有 @Injectable() 装饰器的类中实现自定义 Nest中间件。 这个类应该实现 NestMiddleware 接口

### 设置中间件
```js
// logger.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response ,NextFunction} from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log("Request...");
    next();
  }
}
```
### 应用中间件

我们必须使用模块类的 configure() 方法来设置它们。包含中间件的模块必须实现 NestModule 接口。我们将 LoggerMiddleware 设置在 ApplicationModule 层上。
```js
import { Module,NestModule,NestMiddleware,MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {CatModule} from "./cat/cat.module"
import {LoggerMiddleware} from "./common/middleware/logger.middleware"
@Module({
  imports: [CatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 这里只针对路由为/cat的走中间件
    consumer.apply(LoggerMiddleware).forRoutes('cat');
  }
}
```
forRoutes() 可接受一个字符串、多个字符串、对象、一个控制器类甚至多个控制器类。在大多数情况下，您可能只会传递一个由逗号分隔的控制器列表。以下是单个控制器的示例：
```js
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 指定请求方式 只针对路由为/cat并get请求的
   consumer.apply(LoggerMiddleware).forRoutes({ path: 'cat', method: RequestMethod.GET });
   // 控制器
   //consumer.apply(LoggerMiddleware).forRoutes(CatController);
   // 也可以路由通配符
   // forRoutes({ path: 'ab*cd', method: RequestMethod.ALL });
   // 排除某些路由
  /*  
    consumer.apply(LoggerMiddleware) .exclude(
      { path: 'cats', method: RequestMethod.GET },
      { path: 'cats', method: RequestMethod.POST },
      'cats/(.*)',
    )
    .forRoutes(CatsController);
  */

  }
}
```

### 函数式中间件

它没有成员，没有额外的方法，没有依赖关系，可以考虑使用函数式中间件。
```js
export function logger(req, res, next) {
  console.log(`Request...`);
  next();
};
```
### 多个中间件

为了绑定顺序执行的多个中间件，我们可以在 apply() 方法内用逗号分隔它们。

```js
consumer.apply(cors(), helmet(), logger).forRoutes(CatController);
```
### 全局中间件

如果我们想一次性将中间件绑定到每个注册路由，我们可以使用由INestApplication实例提供的 use()方法：

```ts
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

## 异常过滤器

**Exception Filter**内置的异常层负责处理整个应用程序中的所有抛出的异常。当捕获到未处理的异常时，最终用户将收到友好的响应。
```ts
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
在Nest中内置了一个HttpException对象，支持抛出标准HTTP异常：
```ts
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```
这时返回的默认错误信息是：

```ts
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

### 重写json返回

在HttpException第一个参数传入一个对象，即可覆盖message，如：

```ts
@Get()
async findAll() {
  throw new HttpException({
    status: HttpStatus.FORBIDDEN,
    error: 'This is a custom message',
  }, HttpStatus.FORBIDDEN);
}
```
```ts
{
  "status": 403,
  "error": "This is a custom message"
}
```
### 自定义异常

自定义异常可直接继承自HttpException类：
```ts
export class ForbiddenException extends HttpException {
  constructor() {
    super("Forbidden", HttpStatus.FORBIDDEN);
  }
}
```
```ts
@Get()
async findAll() {
  throw new ForbiddenException();
}
```

### 自定义异常过滤器

```ts
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    console.log('上下文',ctx);
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionRes:any=exception.getResponse()
    const {error,msg}=exceptionRes
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      msg
    });
  }
}
```
异常过滤器被@Catch()装饰器修饰，@Catch(HttpException)表示这里只catch HttpException的异常，可以通过host获取当前执行上下文。

### 绑定特定路由

```ts
// app.controller.ts
  @Get()
  @UseFilters(new HttpExceptionFilter)
  async getHello(@Query() { id },): Promise<any> {
    if (!id) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        msg: '请求参数id必传',
        error: 'id is required'
      }, HttpStatus.BAD_REQUEST)
    }
    return await this.appService.getHello();
  }
```
访问出错抛出如下错误
```ts
{
    "statusCode": 400,
    "timestamp": "2021-06-20T06:56:26.387Z",
    "path": "/api/user",
    "error": "id is required",
    "msg": "请求参数id必传"
}
```

### 全局绑定

```ts
// main.ts
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(3000);
}
```

## 管道

**Pipe**在Nest中，管道主要有两方面用途——`数据转换`、`参数校验`。

管道处于请求到达Controller的处理方法之前，可以在这个时机对请求参数进行校验或一些数据上的适配转换工作。

```ts
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catService.findOne(id);
}
```
在参数装饰器的第二个参数，可以传入具体的Pipe，在上述例子中，使用ParseIntPipe装饰器，保证传入的id一定是number类型，否则，将会返回以下错误：
```ts
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```
也可以通过实例化的方式，修改默认的httpStatusCode:
```ts
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catService.findOne(id);
}
```
nestjs自带6个开箱即用的管道：
- ValidationPipe
- ParseIntPipe
- ParseBoolPipe
- ParseArrayPipe
- ParseUUIDPipe
- DefaultValuePipe

### 自定义管道

```ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";

@Injectable()
export class ValidationPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const val=parseInt(value,10)
    if(isNaN(val)){
      throw new BadRequestException('参数不合法，需为Number类型')
    }
    return value;
  }
}
```
自定义管道需要实现PipeiTransform接口，该接口定义了transform方法，其中value是路由接受到的数据原始值，metadata的定义如下：

```ts
export interface ArgumentMetadata {
  type: "body" | "query" | "param" | "custom";
  metatype?: Type<unknown>;
  data?: string;
}
```
其中metatype表示参数类型，data表示原始的参数字符串。

### 基于Decorator的校验

之前提到过，参数可以通过Dto做声明：
```ts
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```
```ts
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

但这仅仅是从 TS 层面的声明，运行态我们是无法对前端传入的参数进行校验，我们可能会将校验的逻辑写到Controller中，但实际上校验的逻辑非常类似，分散到每个Controller中属于重复代码，同时也违反了SRP

### 使用Class-Validator进行校验

class-validator是一个强大的开源库，支持使用decorator的方式进行类型校验，如：

```ts
import { IsString, IsInt } from "class-validator";

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```
然后创建一个ValidationPipe作为校验管道：

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException("Validation failed");
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```
在这里我们使用了一个plainToClass方法，是由class-transformer提供的（和class-validator是同一个作者），它可以帮助我们将一个原始对象与类进行关联，从而能够使得我们定义好的DTO可以验证入参原始对象。

### 绑定到全局
```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```
### 参数转换
```ts
@Get()
async findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {
  return this.catsService.findAll({ activeOnly, page });
}
```
如上所示，对参数进行了默认值转换及类型转换，activeOnly的默认值为 false，强制转换为boolean，page的默认值为0，强制转换为number。

## 守卫

守卫**Guard**是一个被`@Injectable()`修饰的类，实现`CanActivate`接口，决定了路由是否能被处理方法处理：

### 设置守卫
```ts
// src/common/guard/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
// 实现validateRequest 方法，函数中的逻辑可以根据需要变得简单或复杂
const validateRequest=request=>{
  return true
}
```
### 使用守卫
可以使用@useGuards绑定在Controller中：

```ts
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatService } from './cat.service';
import { Cat } from './interfaces/cat.interface';
import {AuthGuard} from "./../common/guard/auth.guard"

@Controller('cat')
// controller全局
@UseGuards(AuthGuard)
export class CatController {
  constructor(private catService: CatService) {}

  @Post()
  // 单个请求
  @UseGuards(AuthGuard)
  async create(@Body() createCatDto: CreateCatDto) {
    this.catService.create(createCatDto);
  }

  @Get()
  async findAll(@Query() query): Promise<Cat[]> {
    console.log('获猫猫',query);
    return this.catService.findAll();
  }
}
```
也可以绑定在全局的Module中：
```ts
// app.module.ts
@Module({
  imports: [CatModule],
  controllers: [AppController],
  // providers: [AppService],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService
  ],
})
```
另外一种是在`main.ts`中设置
```ts
import {AuthGuard} from "./common/guard/auth.guard"
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  // 设置全局守卫
  app.useGlobalGuards(new AuthGuard())
  await app.listen(3000);
}
bootstrap()
```
### 多个守卫

守卫装饰器是可以只是输入多个守卫类的，例如@UseGuards(Guard1,Guard2 ...)，很显然，他们的执行顺序是视输入的顺序而定，其中任何一个守卫返回false，接下去的过程都会终止执行。请求过程返回403的状态码。

尝试将守卫分别以全局、类和方法的三种方式进行绑定，观察执行过程的先后顺序。其过程将是先执行全局，然后是控制器，最后是方法。（有兴趣的同学可以克隆源码观察这个过程，这里不再赘述）

### 装饰器与元数据

守卫现在在正常工作，但还不是很智能。我们仍然没有利用最重要的守卫的特征，即执行上下文。它还不知道角色，或者每个处理程序允许哪些角色。例如，`CatController` `可以为不同的路由提供不同的权限方案`。其中`一些可能只对管理用户可用，而另一些则可以对所有人开放`。我们如何以灵活和可重用的方式将角色与路由匹配起来?
**这就是自定义元数据发挥作用的地方。**

Nest提供了通过 `@SetMetadata()` 装饰器将定制元数据附加到路由处理程序的能力。这些元数据提供了我们所缺少的角色数据，而守卫需要这些数据来做出决策。让我们看看使用`@SetMetadata():`

```ts
// src/common/guard/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from '@nestjs/core';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles =this.reflector.get<string[]>("auth", context.getHandler());
    console.log('获取的auth权限',roles);
    // 获取的auth权限 [ 'admin', 'man' ]
    return validateRequest(request);
  }
}
const validateRequest=request=>{
  console.log('守卫',request.headers);
  /*
    {
      'content-type': 'application/json',
      'user-agent': 'PostmanRuntime/7.28.0',
      accept: '',
      'cache-control': 'no-cache',
      'postman-token': '55855348-ac4b-4b84-9202-77503a5ed6ab',
      host: '127.0.0.1:3000',
      'accept-encoding': 'gzip, deflate, br',
      connection: 'keep-alive',
      'content-length': '17',
      cookie: 'csrfToken=5vJ8HPpNQZmycqSmzN1JzyuJ'
    }
   */
  return true
}
```

```ts
// src/cat/cat.controller.ts
import {AuthGuard} from "./../common/guard/auth.guard"
@Controller('cat')
export class CatController {
  constructor(private catService: CatService) {}
  @Put(":id")
  // 自定义元数据
  @SetMetadata('auth',['admin','man'])
  @UseGuards(AuthGuard)
  async update(@Param() {id}){
    console.log('参数',id);
    return "更新成功"
  }
}
```
上面的
```ts
 @SetMetadata('auth',['admin','man'])
```
可以创建你自己的装饰器
```ts
// src/common/decorator/auth.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const Auth = (...roles: string[]) => SetMetadata('auth', roles);
```
```ts
  @Auth('admin','man')
  @UseGuards(AuthGuard)
```
## 拦截器

拦截器就是为了让`数据在展示前做一些自定义的操作`，如`统一定义返回体的内容`，在`返回之前对某些数据做一些操作`等，`中间件管理路由请求之前的操作`，`拦截器管理路由请求之后的操作`。

拦截器使用`@Injectable`装饰器，并实现`NestInterceptor`接口。  

主要作用：
- 在函数执行之前/之后绑定额外的逻辑
- 转换从函数返回的结果
- 转换从函数抛出的异常
- 扩展基本函数行为
- 根据所选条件完全重写函数（如缓存目的）

每个拦截器都有`intercept(ExecutionContext, CallHandler)`方法，第一个参数是`执行上下文`，第二个参数是`调用处理程序`

在调用next.handle()之后，就进入了下一个业务过程。如果需求要根据一些条件来修改返回值，那么就要针对返回结果来执行一些逻辑。回看一下代码，intercept方法的返回值类型是Observable，它是[RxJS](https://rxjs-dev.firebaseapp.com/guide/overview)的核心类型。

next是指向下一个过程的对象，先通过handle()方法获得observable的对象，然后用pipe()方法将所需要操作逻辑加入。如果需要对结果就行一定对转换，可以使用map操作符：


- observable.pipe(op1,op2,op3...)，pipe方法可以输入管道操作符。
- map：可以修改输入的值，再输出。类似于JS的map函数；
- tap：每次输入值后接收，但不改变值；
- timeout：设置一个过期时间，当这个时间段内没有接收到完成信号就会出发这个逻辑；
- catchError：当管道中发生异常（throw）后，执行的操作

### 自定义拦截器
```ts
//请求时长拦截器
//nest g in common/interceptor/logging
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    const now = Date.now();
    return next
    .handle()
    .pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)),
    );
  }
}
```
### 绑定拦截器
```ts
 // 路由拦截器
  @Get('man')
  @UseInterceptors(LoggingInterceptor)
  async findOne(@Query() query): Promise<String> {
    return '查找男猫猫'
  }
 // controller
  @Controller('cat')
  @UseInterceptors(LoggingInterceptor)
  export class CatController {
   }
  // module
  import { APP_INTERCEPTOR } from '@nestjs/core';
  @Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  })
  // 全局
  app.useGlobalInterceptors(new LoggingInterceptor());
```

### 超时和异常捕获

超时
```ts
// common/interceptor/timeout.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err=>{
        if(err instanceof TimeoutError)
          return throwError(new RequestTimeoutException())
        return throwError(err)
      })
    );
  }
}

```
异常捕获
```ts
// common/interceptor/exception.interceptor.ts
import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import {catchError} from "rxjs/operators"
@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err=>throwError(new HttpException('系统异常',HttpStatus.BAD_GATEWAY)))
    );
  }
}
```
响应统一处理
```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import {map} from "rxjs/operators"
export interface Response<T>{
  code:Number,
  data:T,
  msg:String
}
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    //解析上下文
    const ctx=context.switchToHttp()
    const request=ctx.getRequest()
    return next.handle().pipe(map(data => {
      console.log('结果',data);
      return {
        code:0,
        data,
        msg:'请求成功',
        timestamp:+new Date(),
        path:request.url
      }
    }));
  }
}
```
## 自定义装饰器

前面守卫已经定义过装饰器`Auth`, [装饰器](https://es6.ruanyifeng.com/#docs/decorator)可以重复利用装饰的方法。

### 实现个装饰器
```ts
// src/common/decorator/user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
```
我们利用`createParamDecorator`实现了一个简单的参数装饰器，返回`request.user`数据，这样就可以在`Controller`中愉快地使用了：
```ts
// src/cat/cat.controller.ts
//http://127.0.0.1:3000/api/cat/man
//请求body { user: { name: '小王', age: 12 } }

@Get('man')
  async findOne(@User() user): Promise<String> {
    console.log('获取请求值',user); //获取请求值 { user: { name: '小王', age: 12 } }
    return '查找男猫猫'
}
```
然后，您可以通过控制器中的 `@User()` 装饰器访问以下特定属性：
```ts
// src/common/decorator/user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data?request.body?.user[data]:request.body;
  }
);
// src/cat/cat.controller.ts
 @Get('man')
  async findOne(@User('name') user): Promise<String> {
    console.log('获取请求值',user); //直接取出name值 小王
    return '查找男猫猫'
  }
```

### 组合多个装饰器
```ts
import { applyDecorators } from "@nestjs/common";

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized"' })
  );
}
```
为了简化我们装饰器，可以将常用的装饰器使用applyDecorators组合起来，代码看上去更加地简洁：
```ts
@Get('users')
@Auth('admin')
findAllUsers() {}
```


## 模板引擎

模板引擎和配置静态资源


[Nest.js完全入门指南](https://erasermeng.github.io/nest-doc/#%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C)  
[深入nestjs](https://juejin.cn/post/6943791344414359560)  
[Nestjs 框架教程](https://wtdf.io/nestjs-framework-tutorial-1-6-30)   
[nestjs[一例看懂中间件、守卫、管道、异常过滤器、拦截器]](https://blog.csdn.net/lxy869718069/article/details/103960790)   
[Nest框架教程](https://keelii.com/2019/07/03/nestjs-framework-tutorial-1/)
