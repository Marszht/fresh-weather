// 真正api 文件
import Promise from './bluebird'

// 初始化云函数环境
wx.cloud.init({
  env: 'fresh-weather-34df96'
})

/**
 * 获取空气数据
 * @param {*} lat
 * @param {*} lon
 */
 export const getWeather = (lat, lon) => {
   return wx.cloud.callFunction({
     name: 'he-weather',
     data: {
       lat,
       lon
     }
   })
 }

 /**
  * 空气质量
  * @param {*} city
  */
 export const getAir = (city) => {
   return wx.cloud.callFunction({
     name: 'he-air',
     data: {
       city
     }
   })
 }