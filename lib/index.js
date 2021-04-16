/**
 * 换行符
 */
const LINE_BREAK = '\r\n'

/**
 * 生成 boundary 字符串
 * @returns 随机生成的 boundary 字符串，如：----XiaoMingFormData2iAmuWOms5E9tuMq
 */
const genBoundary = () => {
  const base = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let boundary = '----XiaoMingFormData'
  for (let i = 0, len = base.length; i < 16; i++) {
    boundary += base[Math.floor(Math.random() * len)]
  }

  return boundary
}

/**
 * 将字符串转换为 TypedArray 对象表示的数据
 * @param {*} str 待转换字符串
 * @returns 转换后的 TypedArray 对象
 */
const stringToBuffer = str => {
  const array = []
  const len = str.length
  for (let i = 0; i < len; i++) {
    array.push(str.charCodeAt(i))
  }

  return new Uint8Array(array)
}

/**
 * 读取指定路径下的文件数据
 * @param {*} filePath 文件路径
 * @returns Promise API，成功状态下可获取文件二进制数据
 */
const readFile = filePath => {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      success: res => resolve(res.data),
      fail: error => reject(error)
    })
  })
}

/**
 * 上传，支持 Promise API
 * @param {*} options 选项对象
 * @returns 返回上传成功或失败的结果
 */
const wxFormidable = async ({ url, files, method = 'POST', header = {}, success, fail }) => {
  const boundary = genBoundary()
  const startBoundary = `--${boundary}${LINE_BREAK}`
  const endBoundary = `--${boundary}--${LINE_BREAK}`
  const buffer = []
  /* 构建请求主体中 formdata 数据格式 */
  for (let i = 0; i < files.length; i++) {
    let { filePath, filename, name } = files[i]
    const header = `${startBoundary}`
      + `Content-Disposition: form-data; name="${name}"; filename="${filename}"${LINE_BREAK}`
      + `Content-Type: application/octet-stream${LINE_BREAK}${LINE_BREAK}`
    buffer.push(stringToBuffer(header))
    const fileBuffer = await readFile(filePath)
    buffer.push(new Uint8Array(fileBuffer))
    buffer.push(stringToBuffer(LINE_BREAK))
  }
  buffer.push(stringToBuffer(endBoundary))
  // 组装数据结构
  const len = buffer.reduce((result, buf) => result + buf.length, 0)
  const typedArray = new Uint8Array(len)
  let prev = 0
  buffer.forEach(item => {
    item.forEach((curr, index) => typedArray[prev + index] = curr)
    prev += item.length
  })

  /* 发送请求，处理响应 */
  const result = new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      header: {
        ...header,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
      },
      data: typedArray.buffer,
      success: res => res.statusCode === 200 ? resolve(res.data) : reject(res),
      fail: err => reject(err)
    })
  })

  if (success || fail) {
    return result
      .then(data => success && success(data))
      .catch(err => fail && fail(err))
  }
  
  return result
}

module.exports = wxFormidable
