const {wxFormidable} = require('wx-formidable')

Page({
  // 上传文件
  upload() {
    wx.chooseMessageFile({
      count: 9,
      type: 'all',
      success: res => {
        const files = []
        res.tempFiles.forEach(file => {
          files.push({
            name: 'myfile',
            filePath: file.path,
            fileName: file.name,
          })
        })
        const fields = []
        fields.push({
          name: 'username',
          value: 'xiaoming'
        }, {
          name: 'nickname',
          value: 'isaac'
        }, {
          name: 'address',
          value: '陕西 西安'
        })
        // 调用 wxFormidable() 上传文本及文件
        wxFormidable({url: 'http://localhost:3000/api/upload', files, fields})
          .then(data => console.log('上传成功：', data))
          .catch(err => console.log('上传失败：', err))
      }
    })
  },
})
