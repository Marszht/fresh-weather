'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMood = exports.geocoder = exports.jscode2session = exports.getAir = exports.getWeather = exports.addEmotion = exports.getEmotionByOpenidAndDate = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // 真正api 文件


var _bluebird = require('./bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var QQ_MAP_KEY = 'O76BZ-MD3LP-42IDV-V4R37-74P22-GYFUS';
// 初始化云函数环境
wx.cloud.init({
  env: 'fresh-weather-34df96'
});
var db = wx.cloud.database();
// 根据openid 和 日期获取月份相应签到日期的颜色
// 从数据库中查 找数据
// 数据渲染在界面上
var getEmotionByOpenidAndDate = exports.getEmotionByOpenidAndDate = function getEmotionByOpenidAndDate(openid, year, month) {
  var _ = db.command; // 取指令
  // 判断的原因， 防止喜传过来的参数不对
  year = parseInt(year);
  month = parseInt(month);
  var now = new Date();
  var curMonth = now.getMonth();
  var curYear = now.getFullYear();
  var curDay = now.getDate();
  // getTime()获取时间戳
  var start = new Date(year, month - 1, 1).getTime();
  var end = new Date(year, month, 1).getTime();
  // console.log(curYear, curDay, curMonth)
  if (month - 1 === curMonth && curDay <= 20 && year === curYear) {
    // 如果是当前月份并且日期数少于20，那么就一次取出
    return db.collection('diary').where({
      openid: openid,
      tsModified: _.gte(start).and(_.lt(end))
    }).get();
  }
  // 这里因为限制 limit20，所以查询两次，一共31条（最多31天）记录
  return new _bluebird2.default(function (resolve, reject) {
    _bluebird2.default.all([db.collection('diary').where({
      openid: openid,
      tsModified: _.gte(start).and(_.lt(end))
    }).orderBy('tsModified', 'desc').limit(15).get(), db.collection('diary').where({
      openid: openid,
      tsModified: _.gte(start).and(_.lt(end))
    }).orderBy('tsMOdified', 'asc').limit(16).get()]).then(function (data) {
      var _data = data,
          _data2 = _slicedToArray(_data, 2),
          data1 = _data2[0],
          data2 = _data2[1];

      var set = new Set();
      data1 = data1.data || [];
      data2 = data2.data || [];
      // 把这两个月的链接起来
      data = data1.concat(data2).filter(function (v) {
        if (set.has(v._id)) {
          return false;
        }
        set.add(v._id);
        return true;
      });
      resolve({ data: data });
    }).catch(function (e) {
      reject(e);
    });
  });
};
// 增加一条数据， 传参openid & emotion
var addEmotion = exports.addEmotion = function addEmotion(openid, emotion) {
  return db.collection('diary').add({
    data: {
      openid: openid,
      emotion: emotion,
      tsModified: Date.now()
    }
  });
};
/**
 * 获取空气数据
 * @param {*} lat
 * @param {*} lon
 */
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
/**
 * 调用微信接口获取openid
 * @param {*} code
 */
var jscode2session = exports.jscode2session = function jscode2session(code) {
  return wx.cloud.callFunction({
    name: 'jscode2session',
    data: {
      code: code
    }
  });
};
/**
 * 逆经纬度查询
 * @param {*} lat
 * @param {*} lon
 */
var geocoder = exports.geocoder = function geocoder(lat, lon) {
  var success = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
  var fail = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

  return wx.request({
    url: 'https://apis.map.qq.com/ws/geocoder/v1/',
    data: {
      location: lat + ',' + lon,
      key: QQ_MAP_KEY,
      get_poi: 0
    },
    success: success,
    fail: fail
  });
};
/**
 * 获取心情
 */
var getMood = exports.getMood = function getMood(province, city, county) {
  var success = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

  return wx.request({
    url: 'https://wis.qq.com/weather/common',
    data: {
      source: 'wxa',
      weather_type: 'tips',
      province: province,
      city: city,
      county: county
    },
    success: success
  });
};
//# sourceMappingURL=api.js.map
