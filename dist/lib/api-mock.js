'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

// 获取天气接口及数据
var getWeather = exports.getWeather = function getWeather(lat, lon) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: 'http://127.0.0.1:1314/api/he-weather',
      data: {
        lat: lat,
        lon: lon
      },
      success: function success(res) {
        resolve({ result: res.data });
      },
      fail: function fail(e) {
        reject(e);
      }
    });
  });
};
//# sourceMappingURL=api-mock.js.map
