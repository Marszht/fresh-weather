'use strict';

var _apiMock = require('../../lib/api-mock');

var _api = require('../../lib/api');

/*</remove>*/
/*<jdists trigger="prod">
import {getEmotionByOpenidAndDate, addEmotion, jscode2session} from '../../lib/api'
</jdists>*/
/*<remove trigger="prod">*/
var app = getApp();
var globalData = app.globalData;
Page({
  data: {
    avatarUrl: globalData.avatarUrl,
    nickname: globalData.nickname
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
        cb(res.userInfo);
      }
    });
  },
  getUserInfo: function getUserInfo() {
    var _this = this;

    //  如果用户不存在全局数据， 也就是globalData里面没有，就获取
    if (!globalData.nickname || globalData.avatarUrl) {
      // 这个函数不做数据的处理，
      this._getUserInfo(function (rs) {
        _this.setData({
          nickname: rs.nickname,
          avatarUrl: rs.avatarUrl
        });
        // 然后再存入全局
        // globalData.nickname = rs.nickname;
        // globalData.avatarUrl = rs.avatarUrl
      });
    }
    var that = this;
    var openid = wx.getStorageSync('openid');
    // 逻辑数据的处理回调
    function callback() {}
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
        console.log('授权失败');
      });
    }
  },
  getUserOpenId: function getUserOpenId(success, fail) {
    wx.login({
      success: function success(res) {
        console.log('code', res.code);
        // 传临时登陆凭证code
        (0, _apiMock.jscode2session)(res.code).then(function (res) {
          // 没有返回
          console.log('code2', code);
        });
      }
    });
  },
  onLoad: function onLoad() {
    var _this2 = this;

    this.setData({
      // curMonth: dataFormat(new Date(), 'yyy-MM')
    });
    this.getUserOpenId();
    // 另一个参数是失败时的回调函数
    this.getScope(this.getUserInfo, function () {
      _this2.setData({ auth: 0 });
    });
  },

  // 返回
  goBack: function goBack() {
    wx.navigateBack();
  },
  onShareAppMessage: function onShareAppMessage() {
    return {
      title: '我发现了一个好玩的小程序，分享给你看看！',
      path: '/pages/diary/index'
    };
  }
});
//# sourceMappingURL=index.js.map
