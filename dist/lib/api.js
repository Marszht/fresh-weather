'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAir = exports.getWeather = undefined;

var _bluebird = require('./bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 初始化云函数环境
wx.cloud.init({
  env: 'fresh-weather-34df96'
});
/**
 * 获取空气数据
 * @param {*} lat
 * @param {*} lon
 */
// 真正api 文件
var getWeather = exports.getWeather = function getWeather(lat, lon) {
  return wx.cloud.callFunction({
    name: 'he-weather',
    data: {
      lat: lat,
      lon: lon
    }
  });
};
/**
 * 空气质量
 * @param {*} city
 */
var getAir = exports.getAir = function getAir(city) {
  return wx.cloud.callFunction({
    name: 'he-air',
    data: {
      city: city
    }
  });
};
//# sourceMappingURL=api.js.map
