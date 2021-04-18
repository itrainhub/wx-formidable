const wxFormidable = require('wx-formidable')

Page({
  data: {
    region: ['陕西省', '西安市', '未央区'],
    customItem: '全部',
    front: {
      filePath: '../images/add.png',
      fileName: 'add.png',
      name: 'front',
    },
    back: {
      filePath: '../images/add.png',
      fileName: 'add.png',
      name: 'back',
    }
  },
  // 选择地址
  bindRegionChange(e) {
    this.setData({
      region: e.detail.value
    })
  },
  // 选择图片
  chooseImage(e) {
    const side = e.target.dataset.side
    wx.chooseMessageFile({
      count: 1,
      success: res => {
        this.setData({
          [side]: {
            filePath: res.tempFiles[0].path,
            fileName: res.tempFiles[0].name,
            name: side
          }
        })
      }
    })
  },
  // 提交表单数据
  submit(e) {
    const {front, back} = this.data
    const {name, address, idcard} = e.detail.value
    const files = [ front, back ]
    const fields = [
      {
        name: 'name',
        value: name
      }, {
        name: 'address',
        value: address.join()
      }, {
        name: 'idcard',
        value: idcard
      }
    ]
    // 调用 wxFormidable() 上传文本及文件
    wxFormidable({url: 'http://localhost:3000/api/upload', files, fields})
      .then(data => {
        console.log('提交成功：', data)
        wx.showToast({
          title: '提交成功',
        })
      })
      .catch(err => {
        console.log('提交失败：', err)
        wx.showToast({
          title: '提交失败',
        })
      })
  },
})
