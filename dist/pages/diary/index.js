'use strict';

var _apiMock = require('../../lib/api-mock');

var _api = require('../../lib/api');

var _utils = require('../../lib/utils');

var app = getApp();
/*</remove>*/
/*<jdists trigger="prod">
import {getEmotionByOpenidAndDate, addEmotion, jscode2session} from '../../lib/api'
</jdists>*/
/*<remove trigger="prod">*/

var globalData = app.globalData;
Page({
  data: {
    avatarUrl: globalData.avatarUrl,
    nickname: globalData.nickname,
    auth: -1,
    daysStyle: [],
    todayEmotion: '',
    activeEmotion: 'serene',
    // 定义好的数组，心情签到。
    emotion: ['serene', 'hehe', 'ecstatic', 'sad', 'terrified'],
    // 日历上签到显示的颜色
    colors: {
      serene: '#64d9fe',
      hehe: '#d3fc1e',
      ecstatic: '#f7dc0e',
      sad: '#ec238a',
      terrified: '#ee1aea'
    }
  },
  // 不是当前月份的时候
  dateChange: function dateChange(e) {
    // console.log(e.detail)
    var _e$detail = e.detail,
        currentYear = _e$detail.currentYear,
        currentMonth = _e$detail.currentMonth;

    this.setData({
      daysStyle: []
    });
    this.setCalendarColor(currentYear, currentMonth);
  },

  //  选择心情
  checkedColor: function checkedColor(e) {
    var activeEmotion = e.currentTarget.dataset.emotion;
    this.setData({
      activeEmotion: activeEmotion
    });
  },

  // 获取用户权限信息, 参数是可以临时加的？对的
  getScope: function getScope(_success, fail) {
    var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "scope.userInfo";

    wx.getSetting({
      success: function success(res) {
        if (res.authSetting[name]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          // 这里的success就是传过来的参数 this.getUserInfo
          // 还得判断一下参数是否为function
          typeof _success === 'function' && _success();
        } else {
          typeof fail === 'function' && fail();
          // console.log('显示登录授权', this.data.auth)
          // 显示登录授权
        }
      }
    });
  },

  // 获取用户信息
  // 每个小功能都封装成函数
  _getUserInfo: function _getUserInfo() {
    var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

    wx.getUserInfo({
      success: function success(res) {
        // console.log('info', res.userInfo)
        cb(res.userInfo);
      }
    });
  },

  //  从数据库中选出当月的签到
  _setDayData: function _setDayData(data, year, month) {
    var colors = this.data.colors;
    var styles = [];
    var now = new Date();
    var today = (0, _utils.dateFormat)(now);
    var todayEmotion = '';
    data.forEach(function (v) {
      var ts = v.tsModified;
      var date = new Date(ts);
      var day = date.getDate();
      if (today === (0, _utils.dateFormat)(date)) {
        // console.log('dbaidb')
        todayEmotion = v.emotion || '';
      }
      styles.push({
        month: 'current',
        day: day,
        color: 'black',
        background: colors[v.emotion]
      });
    });
    // console.log(styles, today)
    // console.log(`${year}-${('00' + month).slice(-2)}`)
    this.setData({
      lastMonth: year + '-' + ('00' + month).slice(-2),
      showPublish: true,
      todayEmotion: todayEmotion,
      daysStyle: styles
    });
  },

  // 设置日历签到颜色
  setCalendarColor: function setCalendarColor(year, month) {
    var _this = this;

    year = year || new Date().getFullYear();
    month = month || new Date().getMonth() + 1;
    (0, _api.getEmotionByOpenidAndDate)(this.data.openid, year, month).then(function (r) {
      // console.log('签到数据', r.data)
      var data = r.data || [];
      globalData['diary-' + year + '-' + month] = data;
      _this._setDayData(data, year, month);
    }).catch(function (e) {
      wx.showToast({
        title: '加载已签到数据失败，请稍后再试',
        icon: 'none',
        duration: 3000
      });
    });
  },

  // 获取用户信息
  getUserInfo: function getUserInfo() {
    var _this2 = this;

    //  如果用户不存在全局数据， 也就是globalData里面没有，就获取
    if (!globalData.nickname || globalData.avatarUrl) {
      // 这个函数不做数据的处理，
      this._getUserInfo(function (rs) {
        _this2.setData({
          nickname: rs.nickName,
          avatarUrl: rs.avatarUrl
        });
        // 然后再存入全局
        globalData.nickname = rs.nickName;
        globalData.avatarUrl = rs.avatarUrl;
      });
    }
    var that = this;
    var openid = wx.getStorageSync('openid');
    // 逻辑数据的处理回调
    function callback() {
      that.setData({
        auth: 1,
        openid: openid
      });
      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth() + 1;
      //  最好赋默认值
      var data = globalData['diary-' + year + '-' + month] || [];
      console.log('diary', data);
      // console.log('callback', data)
      if (data && data.length) {
        that._setDayData({ data: data, year: year, month: month });
      } else {
        that.setCalendarColor();
      }
    }
    if (openid) {
      callback();
    } else {
      this.getUserOpenId(
      // 成功的回调
      function (res) {
        openid = res.result.openid;
        callback();
      },
      // 获取openid 失败的回调
      function () {
        _this2.setData({ auth: 0 });
        console.log('授权失败');
      });
    }
  },

  // 获取用户的 oppenid 以及 session_key
  getUserOpenId: function getUserOpenId(_success2, fail) {
    wx.login({
      success: function success(res) {
        // console.log('code', res.code)
        // 传临时登陆凭证code
        (0, _apiMock.jscode2session)(res.code).then(function (res) {
          var _ref = res.result || {},
              _ref$openid = _ref.openid,
              openid = _ref$openid === undefined ? '' : _ref$openid,
              _ref$session_key = _ref.session_key,
              session_key = _ref$session_key === undefined ? '' : _ref$session_key;

          if (openid && session_key) {
            wx.setStorage({
              key: 'openid',
              data: openid
            });
            // 参数里面的回调函数
            typeof _success2 === 'function' && _success2(res);
          } else {
            typeof fail === 'function' && fail();
          }
          // 没有返回
          // console.log('code2', code)
        });
      }
    });
  },
  onLoad: function onLoad() {
    var _this3 = this;

    // console.log('todayEmotion', this.data.todayEmotion)
    this.setData({
      curMonth: (0, _utils.dateFormat)(new Date(), 'yyyy-MM')
    });
    console.log('curMonth', (0, _utils.dateFormat)(new Date(), 'yyyy-MM')); // 当前月份   
    // this.getUserOpenId()
    // 另一个参数是失败时的回调函数
    this.getScope(this.getUserInfo, function () {
      // 如果失败还是显示要获取授权状态
      _this3.setData({ auth: 0 });
    });
  },

  // 返回
  goBack: function goBack() {
    wx.navigateBack();
  },

  // 提交心情
  submmitEmotion: function submmitEmotion() {
    var _this4 = this;

    var _data = this.data,
        openid = _data.openid,
        activeEmotion = _data.activeEmotion,
        colors = _data.colors;

    (0, _api.addEmotion)(openid, activeEmotion).then(function (r) {
      if (r._id) {
        var styles = _this4.data.daysStyle || [];
        var day = new Date().getDate();
        styles.push({
          month: 'current',
          day: day,
          color: 'black',
          background: colors[activeEmotion]
        });
        _this4.setData({
          daysStyle: styles,
          todayEmotion: activeEmotion
        });
        // 将今天数据更新到globalData
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var data = globalData['diary-' + year + '-' + month] || [];
        if (data.length) {
          data.push({
            openid: openid,
            emotion: activeEmotion,
            tsModified: Date.now()
          });
        }
      }
    }).catch(function (e) {
      wx.showToast({
        title: '签到失败，请稍后再试',
        icon: 'none',
        duration: 3000
      });
    });
  },
  onShareAppMessage: function onShareAppMessage() {
    return {
      title: '我发现了一个好玩的小程序，分享给你看看！',
      path: '/pages/diary/index'
    };
  }
});
//# sourceMappingURL=index.js.map
