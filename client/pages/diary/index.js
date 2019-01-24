/*<remove trigger="prod">*/
import { jscode2session } from '../../lib/api-mock'
import { getEmotionByOpenidAndDate, addEmotion } from '../../lib/api'
/*</remove>*/

/*<jdists trigger="prod">
import {getEmotionByOpenidAndDate, addEmotion, jscode2session} from '../../lib/api'
</jdists>*/
import { dateFormat } from '../../lib/utils'
const app = getApp()
const globalData = app.globalData;
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
  dateChange(e) {
    // console.log(e.detail)
    let { currentYear, currentMonth } = e.detail
    this.setData({
      daysStyle: []
    })
    this.setCalendarColor(currentYear, currentMonth)
  },
  //  选择心情
  checkedColor(e) {
    let activeEmotion = e.currentTarget.dataset.emotion;
    this.setData({
      activeEmotion
    })
  },
  // 获取用户权限信息, 参数是可以临时加的？对的
  getScope(success, fail, name = "scope.userInfo") {
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
  _getUserInfo(cb = () => { }) {
    wx.getUserInfo({
      success: (res) => {
        // console.log('info', res.userInfo)
        cb(res.userInfo)
      }
    })
  },
  //  从数据库中选出当月的签到
  _setDayData(data, year, month) {
    const colors = this.data.colors;
    const styles = [];
    const now = new Date();
    const today = dateFormat(now);
    let todayEmotion = '';
    data.forEach((v) => {
      let ts = v.tsModified;
      let date = new Date(ts);
      let day = date.getDate();
      if (today === dateFormat(date)) {
        // console.log('dbaidb')
        todayEmotion = v.emotion || ''
      }
      styles.push({
        month: 'current',
        day,
        color: 'black',
        background: colors[v.emotion]
      })
    })
    // console.log(styles, today)
    // console.log(`${year}-${('00' + month).slice(-2)}`)
    this.setData({
      lastMonth: `${year}-${('00' + month).slice(-2)}`,
      showPublish: true,
      todayEmotion,
      daysStyle: styles
    })
  },
  // 设置日历签到颜色
  setCalendarColor(year, month) {
    year = year || new Date().getFullYear();
    month = month || new Date().getMonth() + 1;
    getEmotionByOpenidAndDate(this.data.openid, year, month)
      .then((r) => {
        // console.log('签到数据', r.data)
        const data = r.data || [];
        globalData[`diary-${year}-${month}`] = data;
        this._setDayData(data, year, month);
      })
      .catch((e) => {
        wx.showToast({
          title: '加载已签到数据失败，请稍后再试',
          icon: 'none',
          duration: 3000
        })
      })
  },
  // 获取用户信息
  getUserInfo() {
    //  如果用户不存在全局数据， 也就是globalData里面没有，就获取
    if (!globalData.nickname || globalData.avatarUrl) {
      // 这个函数不做数据的处理，
      this._getUserInfo((rs) => {
        this.setData({
          nickname: rs.nickName,
          avatarUrl: rs.avatarUrl
        })
        // 然后再存入全局
        globalData.nickname = rs.nickName;
        globalData.avatarUrl = rs.avatarUrl
      })
    }
    const that = this;
    let openid = wx.getStorageSync('openid');
    // 逻辑数据的处理回调
    function callback() {
      that.setData({
        auth: 1,
        openid
      })
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      //  最好赋默认值
      const data = globalData[`diary-${year}-${month}`] || []
      console.log('diary', data)
      // console.log('callback', data)
      if (data && data.length) {
        that._setDayData({ data, year, month })
      } else {
        that.setCalendarColor()
      }
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
          this.setData({ auth: 0 })
          console.log('授权失败')
        }
      )
    }
  },
  // 获取用户的 oppenid 以及 session_key
  getUserOpenId(success, fail) {
    wx.login({
      success: (res) => {
        // console.log('code', res.code)
        // 传临时登陆凭证code
        jscode2session(res.code).then((res) => {
          let { openid = '', session_key = '' } = res.result || {};
          if (openid && session_key) {
            wx.setStorage({
              key: 'openid',
              data: openid
            })
            // 参数里面的回调函数
            typeof success === 'function' && success(res)
          } else {
            typeof fail === 'function' && fail()
          }
          // 没有返回
          // console.log('code2', code)
        })
      }
    })
  },
  onLoad() {
    // console.log('todayEmotion', this.data.todayEmotion)
    this.setData({
      curMonth: dateFormat(new Date(), 'yyyy-MM')
    })
    console.log('curMonth', dateFormat(new Date(), 'yyyy-MM')) // 当前月份   
    // this.getUserOpenId()
    // 另一个参数是失败时的回调函数
    this.getScope(this.getUserInfo, () => {
      // 如果失败还是显示要获取授权状态
      this.setData({ auth: 0 })
    })
  },
  // 返回
  goBack() {
    wx.navigateBack()
  },
  // 提交心情
  submmitEmotion() {
    let { openid, activeEmotion, colors } = this.data
    addEmotion(openid, activeEmotion)
      .then((r) => {
        if (r._id) {
          let styles = this.data.daysStyle || []
          let day = new Date().getDate();
          styles.push({
            month: 'current',
            day,
            color: 'black',
            background: colors[activeEmotion]
          });
          this.setData({
            daysStyle: styles,
            todayEmotion: activeEmotion
          })
          // 将今天数据更新到globalData
          const now = new Date();
          const year = now.getFullYear()
          const month = now.getMonth() + 1
          const data = globalData[`diary-${year}-${month}`] || []
          if (data.length) {
            data.push({
              openid,
              emotion: activeEmotion,
              tsModified: Date.now()
            })
          }
        }
      })
      .catch((e) => {
        wx.showToast({
          title: '签到失败，请稍后再试',
          icon: 'none',
          duration: 3000,
        })
      })
  },
  onShareAppMessage() {
    return {
      title: '我发现了一个好玩的小程序，分享给你看看！',
      path: '/pages/diary/index'
    }
  }
})