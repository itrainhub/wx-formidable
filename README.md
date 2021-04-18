# wx-formidable

>  一个微信小程序的模块，用于向后端发送 form-data 格式的数据，特别是文件上传，支持多文件上传功能。

## 安装

使用 npm 安装：

```bash
$ npm i wx-formidable
```

## 使用帮助

1. 进入微信小程序项目根目录内，初始化生成 package.json：

```bash
$ npm init -y
```

2. 安装包：

```bash
$ npm i wx-formidable
```

3. 在微信开发者工具中的菜单栏执行 `工具 --> 构建 npm` 菜单任务，会根据项目根目录下 `node_modules` 目录中的内容生成 `miniprogram_npm` 目录

4. 在微信开发者工具中的菜单栏打开 `工具 --> 项目详情`，勾选 `本地设置` 选项卡中的 `使用 npm 模块` 项

5. 在微信小程序中使用库：

```js
// 引入 wx-formidable 库
const wxFormidable = require('wx-formidable')

// 选择文件并实现多文件上传
wx.chooseMessageFile({
  count: 9,
  type: 'all',
  success: res => {
    // 文本字段
    const fields = [{
      name: 'username',
      value: 'xiaoming'
    }, {
      name: 'nickname',
      value: 'isaac'
    }]
    // 文件
    const files = []
    res.tempFiles.forEach((file, index) => {
      files.push({
        name: 'myfile',
        filePath: file.path,
        filename: file.name,
      })
    })
    // 调用 wxFormidable() 上传文本与文件
    wxFormidable({url: 'http://localhost:3000/api/upload', fields, files})
    	.then(data => console.log('上传成功：', data))
      .catch(err => console.log('上传失败：', err))
  }
})
```

## API

### wxFormidable(options)

调用 wxFormidable() 方法实现 form-data 格式数据传递或多文件上传功能：

```js
const wxFormidable = require('wx-formidable')
const promise = wxFormidable(options)
```

支持 Promise API，当 options 选项中不传递 success 或 fail 回调函数处理返回数据时，wxFormidable() 返回 Promise 对象

### Options

- `url` **{string}** - 后端接口地址
- `method` **{string}** - 请求方法，默认为 `POST`
- `header` **{object}** - 请求头信息
- `fields` **{object[]}** - 文本字段列表，数组中对象结构：
  - `name` **{string}** - 字段名称，发送给后端的参数名
  - `value` **{string}** - 文本值
- `files` **{object[]}** - 上传的文件列表，每个上传文件的信息包括：
  - `name` **{string}** - 字段名称，发送给后端的参数名
  - `filePath` **{string}** - 本地文件路径
  - `fileName` **{string}** - 本地文件名称
- `success` **{function}** - 成功的回调函数：function(data)
- `fail` **{function}** - 失败的回调函数：function(error)