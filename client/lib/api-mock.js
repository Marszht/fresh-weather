import Promise from './bluebird'

// 获取天气接口及数据
export const getWeather = (lat, lon) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:1314/api/he-weather',
      data: {
        lat,
        lon
      },
      success: (res) => {
        console.log('success', res)
        resolve({result: res.data})
      },
      fail: (e) => {
        console.log('sad')
        reject(e)
      }
    }) 
  })
}

// 获得空气质量
export const getAir = (city) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:3000/api/he-air',
      data: {
        city
      },
      success: (res) => {
        resolve({result: res.data})
      },
      fail: (e) => {
        reject(e)
      }
    })
  })
}