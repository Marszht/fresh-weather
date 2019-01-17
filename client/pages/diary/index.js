/*<remove trigger="prod">*/
import { jscode2session } from '../../lib/api-mock'
import { getEmotionByOpenidAndDate, addEmotion } from '../../lib/api'
/*</remove>*/

/*<jdists trigger="prod">
import {getEmotionByOpenidAndDate, addEmotion, jscode2session} from '../../lib/api'
</jdists>*/

const app = getApp()
const globalData = app.globalData;
Page({
  data: {
    avatarUrl: globalData.avatarUrl,
    nickname: globalData.nickname,
  },
  // 获取用户权限信息, 参数是可以临时加的？对的
  getScope(success, fail, name="scope.userInfo") {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting[name]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          // 这里的success就是传过来的参数 this.getUserInfo
          // 还得判断一下参数是否为function
          typeof success === 'function' && success()
        } else {
          typeof fail === 'function' && fail()
          // console.log('显示登录授权', this.data.auth)
          // 显示登录授权
        }
      }
    })
  },
  // 获取用户信息
  // 每个小功能都封装成函数
  _getUserInfo(cb = () => {}) {
    wx.getUserInfo({
      success: (res) => {
        cb(res.userInfo)
      }
    })
  },
  getUserInfo() {
    //  如果用户不存在全局数据， 也就是globalData里面没有，就获取
    if (!globalData.nickname || globalData.avatarUrl) {
      // 这个函数不做数据的处理，
      this._getUserInfo((rs) => {
        this.setData({
          nickname: rs.nickname,
          avatarUrl: rs.avatarUrl
        })
              // 然后再存入全局
      // globalData.nickname = rs.nickname;
      // globalData.avatarUrl = rs.avatarUrl
      })
    }
    const that = this;
    let openid = wx.getStorageSync('openid');
    // 逻辑数据的处理回调
    function callback() {
    }
    if (openid) {
      callback();
    } else {
      this.getUserOpenId(
        // 成功的回调
        (res) => {
          openid = res.result.openid;
          callback()
        },
        // 获取openid 失败的回调
        () => {
          console.log('授权失败')
        }
      )
    }
  },
  getUserOpenId(success, fail) {
    wx.login({
      success: (res) => {
        console.log('code', res.code)        
      // 传临时登陆凭证code
      jscode2session(res.code).then((res) => {
        // 没有返回
        console.log('code2', code)
      })
      }
    })
  },
  onLoad() {
    this.setData({
      // curMonth: dataFormat(new Date(), 'yyy-MM')
    })
    this.getUserOpenId()
    // 另一个参数是失败时的回调函数
    this.getScope(this.getUserInfo, () => {
      this.setData({ auth: 0 })
    })
  },
  // 返回
  goBack() {
    wx.navigateBack()
  },
  onShareAppMessage() {
    return {
      title: '我发现了一个好玩的小程序，分享给你看看！',
      path: '/pages/diary/index'
    }
  }
})