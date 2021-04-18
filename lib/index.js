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
 * 字符串编码，将字符串转换为 TypedArray 对象表示的数据，参考 TextEncoder polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#polyfill
 * @param {*} str 待编码字符串
 * @returns 编码后内容
 */
 const stringToBuffer = str => {
  const len = str.length
  let resPos = -1
  const resArr = new Uint8Array(len * 3)
  for (let point=0, nextcode=0, i = 0; i !== len; ) {
      point = str.charCodeAt(i)
      i += 1
      // https://stackoverflow.com/questions/42181070/why-does-code-points-between-ud800-and-udbff-generate-one-length-string-in-ecm
      if (point >= 0xD800 && point <= 0xDBFF) {
          if (i === len) {
              resArr[resPos += 1] = 0xef/*0b11101111*/
              resArr[resPos += 1] = 0xbf/*0b10111111*/
              resArr[resPos += 1] = 0xbd/*0b10111101*/
              break
          }
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          nextcode = str.charCodeAt(i)
          if (nextcode >= 0xDC00 && nextcode <= 0xDFFF) {
              point = (point - 0xD800) * 0x400 + nextcode - 0xDC00 + 0x10000
              i += 1
              if (point > 0xffff) {
                  resArr[resPos += 1] = (0x1e/*0b11110*/<<3) | (point>>>18)
                  resArr[resPos += 1] = (0x2/*0b10*/<<6) | ((point>>>12)&0x3f/*0b00111111*/)
                  resArr[resPos += 1] = (0x2/*0b10*/<<6) | ((point>>>6)&0x3f/*0b00111111*/)
                  resArr[resPos += 1] = (0x2/*0b10*/<<6) | (point&0x3f/*0b00111111*/)
                  continue;
              }
          } else {
              resArr[resPos += 1] = 0xef/*0b11101111*/
              resArr[resPos += 1] = 0xbf/*0b10111111*/
              resArr[resPos += 1] = 0xbd/*0b10111101*/
              continue
          }
      }
      if (point <= 0x007f) {
          resArr[resPos += 1] = (0x0/*0b0*/<<7) | point
      } else if (point <= 0x07ff) {
          resArr[resPos += 1] = (0x6/*0b110*/<<5) | (point>>>6)
          resArr[resPos += 1] = (0x2/*0b10*/<<6)  | (point&0x3f/*0b00111111*/)
      } else {
          resArr[resPos += 1] = (0xe/*0b1110*/<<4) | (point>>>12)
          resArr[resPos += 1] = (0x2/*0b10*/<<6)    | ((point>>>6)&0x3f/*0b00111111*/)
          resArr[resPos += 1] = (0x2/*0b10*/<<6)    | (point&0x3f/*0b00111111*/)
      }
  }
  return resArr.subarray(0, resPos + 1)
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
 * 生成发送数据的 ArrayBuffer 对象
 * @param {*} data 待处理数据
 * @returns 构建传递给后端的 ArrayBuffer 对象数据及数据中的 boundary
 */
 const genArrayBuffer = async data => {
  const {boundary, fields, files} = data
  const startBoundary = `--${boundary}${LINE_BREAK}`
  const endBoundary = `--${boundary}--${LINE_BREAK}`
  const buffer = []

  /* 构建请求主体中 formdata 数据格式 */
  // 文本字段处理
  for (let i = 0, len = fields.length; i < len; i++) {
    const { name, value } = fields[i]
    const content = ''
      + startBoundary
      + `Content-Disposition: form-data; name="${name}"${LINE_BREAK}${LINE_BREAK}`
      + `${value}${LINE_BREAK}`
    buffer.push(stringToBuffer(content))
  }
  // 文件处理
  for (let i = 0, len = files.length; i < len; i++) {
    let { filePath, fileName, name } = files[i]
    // 如无文件名，从文件路径中获取
    fileName = fileName || /(?:(?!\/).)*$/.exec(filePath)?.[0]
    // 头
    const header = ''
      + startBoundary
      + `Content-Disposition: form-data; name="${name}"; filename="${fileName}"${LINE_BREAK}`
      + `Content-Type: application/octet-stream${LINE_BREAK}${LINE_BREAK}`
    buffer.push(stringToBuffer(header))
    const fileBuffer = await readFile(filePath) // 文件内容
    buffer.push(new Uint8Array(fileBuffer))
    buffer.push(stringToBuffer(LINE_BREAK))
  }
  buffer.push(stringToBuffer(endBoundary))
  // 构建发送的数据 buffer 结果
  const len = buffer.reduce((result, buf) => result + buf.length, 0)
  const typedArray = new Uint8Array(len)
  let prev = 0
  buffer.forEach(item => {
    item.forEach((curr, index) => typedArray[prev + index] = curr)
    prev += item.length
  })
  // 返回构建结果
  return typedArray.buffer
}

/**
 * 上传，支持 Promise API
 * @param {*} options 选项对象：{ url, method, files, header, success, fail }
 * @returns 返回上传成功或失败的结果
 */
const wxFormidable = async ({ url, method = 'POST', header = {}, success, fail, ...data }) => {
  const boundary = genBoundary()
  // 生成要发送给后端的数据
  const buffer = await genArrayBuffer({boundary, ...data})

  /* 发送请求，处理响应 */
  const result = new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      header: {
        ...header,
        'Content-Type': 'multipart/form-data; boundary=' + boundary, // 传递 formdata 数据时设置的头信息
      },
      data: buffer,
      success: res => res.statusCode === 200 ? resolve(res.data) : reject(res),
      fail: err => reject(err)
    })
  })

  // 是否传递 success 或 fail 回调函数
  if (success || fail) {
    return result
      .then(data => success && success(data))
      .catch(err => fail && fail(err))
  }
  
  return result
}

module.exports = wxFormidable
