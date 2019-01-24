const express = require('express')
const path = require('path')
// 像这种常量一般都不写在本地
const {PORT} = require('../config.server.json')

const heWeather = require('./cloud-functions/he-weather').main
const heAir = require('./cloud-functions/he-air/').main
const jscode2session = require('./cloud-functions/jscode2session/').main
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
app.get('/api/he-air', (req, res, next) => {
  heAir(req.query).then(res.json.bind(res)).catch((e) => {
    console.error(e);
    next(e)
  })
  // res.send('getWeatherData')
})
// 引入模块然后分配路由
app.get('/api/he-weather', (req, res, next) => {
  // console.log('api/he-weather', res.json)
  heWeather(req.query).then(res.json.bind(res)).catch ((e) => {
    console.error('why',e)
    next(e)
  })
  // res.send('getWeatherData')  
})


//  得到临时 code临时登陆凭证
app.get('/api/jscode2session', (req, res, next) => {
  // console.log('req.query', req.query)
  jscode2session(req.query).then(res.json.bind(res)).catch((e) => {
    console.error(e)
    next(e)
  })
  // next()
})
// 开启端口为1314的本地服务
app.listen(PORT, () => {
  console.log(`开发服务器启动成功: http://127.0.0.1:${PORT}`)
})