'use strict';

var _apiMock = require('../../lib/api-mock');

/*</remove>*/
/*<jdists trigger="prod">
import {getEmotionByOpenidAndDate, getMood, geocoder, getWeather, getAir} from '../../lib/api'
</jdists>*/
var app = getApp(); /*<remove trigger="prod">*/

Page({
  data: {
    statusBarHeight: 32,
    backgroundImage: "../../images/cloud.jpg",
    backgroundColor: '#62aadc',
    current: {
      temp: '0',
      weather: '数据获取中',
      humidity: '1',
      icon: 'xiaolian'
    },
    today: {
      temp: 'N/A',
      weather: '暂无'
    },
    tomorrow: {
      temp: 'N/A',
      weather: '暂无'
    },
    city: '海口',
    width: 375,
    scale: 1,
    address: '定位中',
    lat: 40.056974,
    lon: 116.307689
  },
  onLoad: function onLoad() {
    var _this = this;

    // 获取系统信息
    // 用于系统适配
    wx.getSystemInfo({
      success: function success(res) {
        var width = res.windowWidth;
        // 适配
        var scale = width / 375;
        _this.setData({
          width: width,
          scale: scale,
          paddingTop: res.statusBarHeight + 12
        });
      }
    });
    var pages = getCurrentPages(); // 获取当前加载页面
    var currentPage = pages[pages.length - 1]; // 获取当前页面对象
    //  获取分享过来的地址
    var query = currentPage.options;
    if (query && query.address && query.lat && query.lon) {
      // setData 是异步的所以需要先获取数据在获取天气数据
      this.setData({
        city: city,
        province: province,
        county: county,
        address: address,
        lat: lat,
        lon: lon
      }, function () {
        _this.getWeatherData();
      });
    } else {
      // this.setDataFormCash()
      // this.getLoacation()
    }
    this.getWeatherData();
  },

  // 跳转到签到页面
  goDiary: function goDiary() {
    try {
      var url = '/pages/diary/index';
      wx.navigateTo({
        url: url
      });
    } catch (e) {
      console.log(e);
    }
  },

  // 获取页面数据 天气数据
  getWeatherData: function getWeatherData(cb) {
    var _this2 = this;

    // wx.showLoading({
    //   title: '获取数据中',
    //   mask: true
    // })
    // 失败的回调
    var fail = function fail(e) {
      wx.hideLoading();
      if (typeof cb === 'function') {
        cb();
      }
      wx.showToast({
        title: '加载失败， 请稍后重试',
        icon: 'none',
        duration: 3000
      });
    };
    var _data = this.data,
        lat = _data.lat,
        lon = _data.lon,
        province = _data.province,
        city = _data.city,
        county = _data.county;
    // 先传默认的经纬度

    console.log('lat, lon', lat, lon);
    (0, _apiMock.getWeather)(lat, lon).then(function (res) {
      wx.hideLoading();
      if (typeof cb === 'function') {
        cb();
      }
      if (res.result) {
        console.log('res.result:', res.result);
      }
    }).catch(fail);
    // 获取空气质量
    (0, _apiMock.getAir)(city).then(function (res) {
      // 严谨一点
      if (res && res.result) {
        console.log('air', res.result);
        _this2.setData({
          air: res.result
        });
      }
    }).catch(function (e) {});
  },

  // 一个分享, 分享你当前地址的天气状况
  onshareAppMessage: function onshareAppMessage() {
    if (!isUpdata) {
      return {
        title: '我发现了一个好玩的天气小程序，分享给你看看！',
        path: 'pages/weather/index'
      };
    } else {
      var _data2 = this.data,
          _lat = _data2.lat,
          _lon = _data2.lon,
          _address = _data2.address,
          _province = _data2.province,
          _city = _data2.city,
          _county = _data2.county;

      var url = '/pages/weather/index?lat=' + _lat + '&lon=' + _lon + '&address=' + _address + '&province=' + _province + '&city=' + _city + '&county=' + _county;
      return {
        title: '\u300C' + _address + '\u300D\u73B0\u5728\u5929\u6C14\u60C5\u51B5\uFF0C\u5FEB\u6253\u5F00\u770B\u770B\u5427\uFF01',
        path: url
      };
    }
  }
});
//# sourceMappingURL=index.js.map
