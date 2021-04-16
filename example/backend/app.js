const express = require('express')
const formidable = require('formidable')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(express.static('public'))

app.post('/api/upload', (req, res, next) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    uploadDir: __dirname + '/public/images',
  })
 
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.json({
        status: 4000,
        error: err.message
      })
      return
    }
    res.json({ fields, files })
  })
})
 
app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...')
})
