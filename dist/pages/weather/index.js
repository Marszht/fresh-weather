'use strict';

var _utils = require('../../lib/utils');

var _chart = require('../../lib/chartjs/chart');

var _chart2 = _interopRequireDefault(_chart);

var _api = require('../../lib/api');

var _apiMock = require('../../lib/api-mock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*</remove>*/
/*<jdists trigger="prod">
import {getEmotionByOpenidAndDate, getMood, geocoder, getWeather, getAir} from '../../lib/api'
</jdists>*/

/*<remove trigger="prod">*/
var app = getApp();
var can = false;
var CHART_CANVAS_HEIGHT = 272 / 2;
var isUpdata = false;
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
  updateLocation: function updateLocation(res) {
    var lat = res.latitude,
        lon = res.longitude,
        name = res.name;

    var data = {
      lat: lat,
      lon: lon
    };
    if (name) {
      data.address = name;
    }
    this.setData(data);
    this.getAddress(lat, lon, name);
  },
  getAddress: function getAddress(lat, lon, name) {
    var _this = this;

    wx.showLoading({
      title: '定位中',
      mask: true
    });
    var fail = function fail(e) {
      _this.setData({
        address: name || '海南大学小仙女宿舍'
      });
      wx.hideLoading();
      _this.getWeatherData();
    };
    // 获取地址， 腾讯地图逆向地址解析
    (0, _api.geocoder)(lat, lon, function (res) {
      wx.hideLoading();
      var result = (res.data || {}).result;
      // console.log(1, res, result)
      if (res.statusCode === 200 && result && result.address) {
        var _address = result.address,
            formatted_addresses = result.formatted_addresses,
            address_component = result.address_component;

        if (formatted_addresses && (formatted_addresses.recommend || formatted_addresses.rough)) {
          _address = formatted_addresses.recommend || formatted_addresses.rough;
        }
        var _province = address_component.province,
            _city = address_component.city,
            _county = address_component.district;

        _this.setData({
          province: _province,
          county: _county,
          city: _city,
          address: name || _address
        });
        _this.getWeatherData();
      } else {
        //失败
        fail();
      }
    }, fail);
  },
  getLocation: function getLocation() {
    var _this2 = this;

    wx.getLocation({
      type: 'gcj02',
      success: function success(res) {
        console.log('location', res);
        _this2.updateLocation(res);
      },
      fail: function fail(e) {
        _this2.openLocation();
      }
    });
  },
  openLocation: function openLocation() {
    wx.showToast({
      title: '检测到您未授权使用位置权限，请先开启哦',
      icon: 'none',
      duration: 3000
    });
  },

  //  地址授权
  // 应该没有执行？ 
  onLocation: function onLocation() {
    var _this3 = this;

    success: (function (_ref) {
      var authSetting = _ref.authSetting;

      console.log('onlocation');
      can = authSetting['scope.userLocation'];
      if (can) {
        _this3.chooseLocation();
      } else {
        _this3.openLocation();
      }
    });
  },
  chooseLocation: function chooseLocation() {
    var _this4 = this;

    wx.chooseLocation({
      success: function success(res) {
        var latitude = res.latitude,
            longitude = res.longitude;
        var _data = _this4.data,
            lat = _data.lat,
            lon = _data.lon;

        if (latitude == lat && lon == longitude) {
          _this4.getWeatherData();
        } else {
          _this4.updateLocation(res);
        }
      }
    });
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
    var _this5 = this;

    wx.showLoading({
      title: '获取数据中',
      mask: true
    });
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
    var _data2 = this.data,
        lat = _data2.lat,
        lon = _data2.lon,
        province = _data2.province,
        city = _data2.city,
        county = _data2.county;
    // 先传默认的经纬度
    // console.log('lat, lon', lat, lon)

    (0, _apiMock.getWeather)(lat, lon).then(function (res) {
      // console.log('dskabd', res.result)
      wx.hideLoading();
      if (typeof cb === 'function') {
        cb();
      }
      if (res.result) {
        _this5.render(res.result);
        // console.log('res.result:', res.result)
      } else {
        fail();
      }
    }).catch(fail);
    // 获取空气质量
    (0, _apiMock.getAir)(city).then(function (res) {
      // 严谨一点
      if (res && res.result) {
        // console.log('air', res.result)
        _this5.setData({
          air: res.result
        });
      }
    }).catch(function (e) {});
    //  或群签到的心情
    (0, _api.getMood)(province, city, county, function (res) {
      var result = (res.data || {}).data;
      if (result && result.tips) {
        var tips = result.tips.observe;
        var index = Math.floor(Math.random() * Object.keys(tips).length);
        tips = tips[index];
        _this5.setData({ tips: tips });
      }
    });
  },

  // 数据处理
  render: function render(data) {
    // 全局定义了upData 
    isUpdata = true;
    var _data3 = this.data,
        width = _data3.width,
        scale = _data3.scale;
    var hourly = data.hourly,
        daily = data.daily,
        current = data.current,
        lifeStyle = data.lifeStyle,
        _data$oneWord = data.oneWord,
        oneWord = _data$oneWord === undefined ? '' : _data$oneWord;
    var backgroundColor = current.backgroundColor,
        backgroundImage = current.backgroundImage;

    var _today = daily[0],
        _tomorrow = daily[1];
    var today = {
      temp: _today.minTemp + '/' + _today.maxTemp + '\xB0',
      icon: _today.dayIcon,
      weather: _today.day
    };
    var tomorrow = {
      temp: _tomorrow.minTemp + '/' + _tomorrow.maxTemp + '\xB0',
      icon: _tomorrow.dayIcon,
      weather: _tomorrow.day
    };
    this.setData({
      hourlyData: hourly,
      weeklyData: daily,
      current: current,
      backgroundImage: backgroundImage,
      backgroundColor: backgroundColor,
      today: today,
      tomorrow: tomorrow,
      oneWord: oneWord,
      lifeStyle: lifeStyle
    });
    //  延时画图
    this.drawChart();
    // 缓存数据
    this.dataCache();
    // 启动预取定时器
    this._setPrefetchTimer(10e3);
  },

  // 当第二天的数据不存在时
  dataCache: function dataCache() {
    var _data4 = this.data,
        current = _data4.current,
        backgroundImage = _data4.backgroundImage,
        backgroundColor = _data4.backgroundColor,
        today = _data4.today,
        tomorrow = _data4.tomorrow,
        address = _data4.address,
        tips = _data4.tips,
        hourlyData = _data4.hourlyData;

    wx.setStorage({
      key: 'defaultData',
      data: {
        current: current,
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage,
        today: today,
        tomorrow: tomorrow,
        address: address,
        tips: tips,
        hourlyData: hourlyData
      }
    });
  },
  setDataFormCache: function setDataFormCache() {
    var _this6 = this;

    wx.getStorage({
      key: 'defaultData',
      success: function success(_ref2) {
        var data = _ref2.data;

        // 判断是否更新了
        if (data || !isUpdata) {
          // 存在并且没有获取数据成功，那么可以给首屏赋值上次数据
          var current = data.current,
              backgroundImage = data.backgroundImage,
              backgroundColor = data.backgroundColor,
              today = data.today,
              tomorrow = data.tomorrow,
              _address2 = data.address,
              tips = data.tips,
              hourlyData = data.hourlyData;

          _this6.setData({
            current: current,
            backgroundColor: backgroundColor,
            backgroundImage: backgroundImage,
            today: today,
            tomorrow: tomorrow,
            address: _address2,
            tips: tips,
            hourlyData: hourlyData
          });
        }
      }
    });
  },

  //  赋值，， 默认值
  _setPrefetchTimer: function _setPrefetchTimer() {
    var _this7 = this;

    var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10e3;

    // 10s 预取
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var data = app.globalData['diary-' + year + '-' + month] || [];
    if (!data.length && isUpdata) {
      prefetchTimer = setTimeout(function () {
        _this7.prefetch();
      }, delay);
    }
  },
  prefetch: function prefetch() {
    var openid = wx.getStorageSync('openid');
    if (openid) {
      // 存在则预取当前时间的心情
      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth() + 1;
      (0, _api.getEmotionByOpenidAndDate)(openid, year, month).then(function (r) {
        var data = r.data || [];
        app.globalData['diary-' + year + '-' + month] = data;
        console.log('globalData', app.globalData);
      }).catch(function (e) {});
    }
  },

  // chart 画图
  // 直接用不用看， 以后有涉及就临时看
  drawChart: function drawChart() {
    console.log('cahrt');
    var _data5 = this.data,
        width = _data5.width,
        scale = _data5.scale,
        weeklyData = _data5.weeklyData;

    var height = CHART_CANVAS_HEIGHT * scale;
    var ctx = wx.createCanvasContext('chart');
    (0, _utils.fixChart)(ctx, width, height);
    // 添加温度
    _chart2.default.pluginService.register({
      afterDatasetsDraw: function afterDatasetsDraw(e, t) {
        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle');
        ctx.setFontSize(16);
        e.data.datasets.forEach(function (t, a) {
          var r = e.getDatasetMeta(a);
          r.hidden || r.data.forEach(function (e, r) {
            // 昨天数据发灰
            ctx.setFillStyle(r === 0 ? '#e0e0e0' : '#ffffff');
            var i = t.data[r].toString() + '\xb0';
            var o = e.tooltipPosition();
            0 == a ? ctx.fillText(i, o.x + 2, o.y - 8 - 10) : 1 == a && ctx.fillText(i, o.x + 2, o.y + 8 + 10);
          });
        });
      }
    });
    return new _chart2.default(ctx, (0, _utils.getChartConfig)(weeklyData));
  },
  onShow: function onShow() {
    // 提前获取， 防止网络延迟然后数据获取慢
    this._setPrefetchTimer();
    // console.log('globalData', app.globalData)
  },
  onLoad: function onLoad() {
    var _this8 = this;

    // 获取系统信息
    // 用于系统适配
    wx.getSystemInfo({
      success: function success(res) {
        var width = res.windowWidth;
        // 适配
        var scale = width / 375;
        _this8.setData({
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
        _this8.getWeatherData();
      });
    } else {
      // 如果不是从分享的地方过来
      this.setDataFormCache();
      this.getLocation();
    }
  },
  onPullDownRefresh: function onPullDownRefresh() {
    this.getWeatherData(function () {
      wx.stopPullDownRefresh();
    });
  },

  // 一个分享, 分享你当前地址的天气状况
  onshareAppMessage: function onshareAppMessage() {
    if (!isUpdata) {
      return {
        title: '我发现了一个好玩的天气小程序，分享给你看看！',
        path: 'pages/weather/index'
      };
    } else {
      var _data6 = this.data,
          _lat = _data6.lat,
          _lon = _data6.lon,
          _address3 = _data6.address,
          _province2 = _data6.province,
          _city2 = _data6.city,
          _county2 = _data6.county;

      var url = '/pages/weather/index?lat=' + _lat + '&lon=' + _lon + '&address=' + _address3 + '&province=' + _province2 + '&city=' + _city2 + '&county=' + _county2;
      return {
        title: '\u300C' + _address3 + '\u300D\u73B0\u5728\u5929\u6C14\u60C5\u51B5\uFF0C\u5FEB\u6253\u5F00\u770B\u770B\u5427\uFF01',
        path: url
      };
    }
  }
});
//# sourceMappingURL=index.js.map
