/*<remove trigger="prod">*/
import { getMood, geocoder } from '../../lib/api'
import { getWeather, getAir } from '../../lib/api-mock'
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
  updateLocation(res) {
    let { latitude: lat, longitude: lon, name } = res;
    let data = {
      lat,
      lon
    }
    if (name) {
      data.address = name;
    }
    this.setData(data);
    this.getAddress(lat, lon, name)
  },
  getAddress(lat, lon, name) {
    wx.showLoading({
      title: '定位中',
      mask: true
    })
    let fail = (e) => {
      this.setData({
        address: name || '海南大学小仙女宿舍'
      })
      wx.hideLoading()
      this.getWeatherData()
    }
    // 获取地址， 腾讯地图逆向地址解析
    geocoder(
      lat,
      lon,
      (res) => {
        wx.hideLoading()
        let result = (res.data || {}).result
        // console.log(1, res, result)

        if (res.statusCode === 200 && result && result.address) {
          let { address, formatted_addresses, address_component } = result
          if (formatted_addresses && (formatted_addresses.recommend || formatted_addresses.rough)) {
            address = formatted_addresses.recommend || formatted_addresses.rough
          }
          let { province, city, district: county } = address_component
          this.setData({
            province,
            county,
            city,
            address: name || address
          })
          this.getWeatherData()
        } else {
          //失败
          fail()
        }
      },
      fail
    )
  },
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('location', res);
        this.updateLocation(res);
      },
      fail: (e) => {
        this.openLocation()
      }
    })
  },
  openLocation() {
    wx.showToast({
      title: '检测到您未授权使用位置权限，请先开启哦',
      icon: 'none',
      duration: 3000
    })
  },
  //  地址授权
  // 应该没有执行？ 
  onLocation() {
    success: ({authSetting}) => {
      console.log('onlocation')
      can = authSetting['scope.userLocation'];
      if (can) {
        this.chooseLocation()
      } else {
        this.openLocation()
      }
    }
  },
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        let {latitude, longitude} = res
        let {lat, lon} = this.data;
        if (latitude == lat && lon == longitude) {
          this.getWeatherData()
        } else {
          this.updateLocation(res)
        }
      }
    })
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
    const currentPage = pages[pages.length - 1] // 获取当前页面对象
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
      this.getLocation()
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
    const { lat, lon, province, city, county } = this.data
    // 先传默认的经纬度
    // console.log('lat, lon', lat, lon)
    getWeather(lat, lon)
      .then((res) => {
        // console.log('dskabd', res.result)
        wx.hideLoading()
        if (typeof cb === 'function') {
          cb()
        }
        if (res.result) {
          this.render(res.result);
          console.log('res.result:', res.result)
        } else {
          fail();
        }
      })
      .catch(fail)
    // 获取空气质量
    getAir(city)
      .then((res) => {
        // 严谨一点
        if (res && res.result) {
          // console.log('air', res.result)
          this.setData({
            air: res.result
          })
        }
      })
      .catch((e) => { })
  },
  render(data) {
    // isUpdata = true;
    const {width, scale} = this.data;
    const {hourly, daily, current, lifeStyle, oneWord = ''} = data;
    const {backgroundColor, backgroundImage} = current;
    const _today = daily[0],
      _tomorrow = daily[1];
    const today = {
      temp: `${_today.minTemp}/${_today.maxTemp}°`,
      icon: _today.dayIcon,
      weather: _today.day
    }
    const tomorrow = {
      temp: `${_tomorrow.minTemp}/${_tomorrow.maxTemp}°`,
      icon: _tomorrow.dayIcon,
      weather: _tomorrow.day
    }
    this.setData({
      hourlyData: hourly,
      weeklyData: daily,
      current,
      backgroundImage,
      backgroundColor,
      today,
      tomorrow,
      oneWord,
      lifeStyle
    })
  },
  onPullDownRefresh() {
    this.getWeatherData(() => {
      wx.stopPullDownRefresh()
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
      const { lat, lon, address, province, city, county } = this.data
      let url = `/pages/weather/index?lat=${lat}&lon=${lon}&address=${address}&province=${province}&city=${city}&county=${county}`

      return {
        title: `「${address}」现在天气情况，快打开看看吧！`,
        path: url
      }
    }
  }
})