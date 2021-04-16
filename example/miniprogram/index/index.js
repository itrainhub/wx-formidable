const wxFormidable = require('wx-formidable')

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
            filename: file.name,
          })
        })
        // 调用 wxFormidable() 上传文件
        wxFormidable({url: 'http://localhost:3000/api/upload', files})
          .then(data => console.log('上传成功：', data))
          .catch(err => console.log('上传失败：', err))
      }
    })
  },
})
