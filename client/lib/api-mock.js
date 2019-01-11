

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
        resolve({result: res.data})
      },
      fail: (e) => {
        reject(e)
      }
    })
  })
}