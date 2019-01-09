const express = require('express')
const path = require('path')
// 像这种常量一般都不写在本地
const {PORT} = require('../config.server.json')

const app = express()

// 实现静态资源服务
// 使用express.static 将server/static 目录设置为静态资源服务器
// 目录里面的内容为一些静态资源 图片, 让服务器能够访问
app.use(
  '/static',
  express.static(path.join(__dirname, 'static'), {
    index: false,
    maxAge: '30d'
  })
)
// 开启端口为1314的本地服务
app.listen(PORT, () => {
  console.log(`开发服务器启动成功: http://127.0.0.1:${PORT}`)
})