'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jscode2session = exports.getAir = exports.getWeather = undefined;

var _bluebird = require('./bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 获取天气接口及数据
var getWeather = exports.getWeather = function getWeather(lat, lon) {
  // console.log('get')
  return new _bluebird2.default(function (resolve, reject) {
    // console.log('get2')
    wx.request({
      url: 'http://127.0.0.1:1314/api/he-weather',
      data: {
        lat: lat,
        lon: lon
      },
      success: function success(res) {
        console.log('success', res);
        resolve({ result: res.data });
      },
      fail: function fail(e) {
        console.log('sad');
        reject(e);
      }
    });
  });
};
// 获得空气质量
var getAir = exports.getAir = function getAir(city) {
  return new _bluebird2.default(function (resolve, reject) {
    wx.request({
      url: 'http://127.0.0.1:1314/api/he-air',
      data: {
        city: city
      },
      success: function success(res) {
        console.log('air', res);
        resolve({ result: res.data });
      },
      fail: function fail(e) {
        reject(e);
      }
    });
  });
};
// 获取临时登陆凭证
var jscode2session = exports.jscode2session = function jscode2session(code) {
  return new _bluebird2.default(function (resolve, reject) {
    wx.request({
      url: 'http://127.0.0.1:1314/api/jscode2session',
      data: {
        code: code
      },
      success: function success(res) {
        resolve({ result: res.data });
      },
      fail: reject
    });
  });
};
//# sourceMappingURL=api-mock.js.map
