/*<remove trigger="prod">*/
import {getWeather} from '../../lib/api-mock'
/*</remove>*/

/*<jdists trigger="prod">
import {getEmotionByOpenidAndDate, getMood, geocoder, getWeather, getAir} from '../../lib/api'
</jdists>*/
const app = getApp()

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
  onLoad() {
    // 获取系统信息
    // 用于系统适配
    wx.getSystemInfo({
      success: (res) => {
        let width = res.windowWidth
        // 适配
        let scale = width / 375
        this.setData({
          width,
          scale,
          paddingTop: res.statusBarHeight + 12
        })
      }
    })
    const pages = getCurrentPages()  // 获取当前加载页面
    const currentPage = pages[pages.length-1] // 获取当前页面对象
    //  获取分享过来的地址
    const query = currentPage.options
    if (query && query.address && query.lat && query.lon) {
      // setData 是异步的所以需要先获取数据在获取天气数据
      this.setData({
        city,
        province,
        county,
        address,
        lat,
        lon
      },
    () => {
      this.getWeatherData()
    })
    } else {
      // this.setDataFormCash()
      // this.getLoacation()
    }
    this.getWeatherData()

  },
  // 跳转到签到页面
  goDiary() {
    try {
      let url = `/pages/diary/index`
      wx.navigateTo({
        url
      })
    } catch (e) {
      console.log(e)
    }
  },
  // 获取页面数据 天气数据
  getWeatherData(cb) {
    wx.showLoading({
      title: '获取数据中',
      mask: true
    })
    // 失败的回调
    const fail = (e) => {
      wx.hideLoading()
      if (typeof cb === 'function') {
        cb()
      }
      wx.showToast({
        title: '加载失败， 请稍后重试',
        icon: 'none',
        duration: 3000
      })
    }
    const {lat, lon, province, city, county} = this.data
    // 先传默认的经纬度
    console.log('lat, lon',lat, lon)
    getWeather(lat, lon)
      .then((res) => {
        wx.hideLoading()
        if (typeof cb === 'function') {
          cb()
        }
        if (res.result) {
          console.log('res.result:', res.result)
        }
      })
  },
  // 一个分享, 分享你当前地址的天气状况
  onshareAppMessage() {
    if (!isUpdata) {
      return {
        title: '我发现了一个好玩的天气小程序，分享给你看看！',
        path: 'pages/weather/index'
      }
    } else {
      const {lat, lon, address, province, city, county} = this.data
      let url = `/pages/weather/index?lat=${lat}&lon=${lon}&address=${address}&province=${province}&city=${city}&county=${county}`

      return {
        title: `「${address}」现在天气情况，快打开看看吧！`,
        path: url
      }
    }
  }

})