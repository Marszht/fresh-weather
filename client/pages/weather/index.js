// 这些直接套进来就好
import { fixChart, getChartConfig, drawEffect } from '../../lib/utils';
import Chart from '../../lib/chartjs/chart'
/*<remove trigger="prod">*/
import { getMood, geocoder, getEmotionByOpenidAndDate } from '../../lib/api'
import { getWeather, getAir } from '../../lib/api-mock'
/*</remove>*/

/*<jdists trigger="prod">
import {getEmotionByOpenidAndDate, getMood, geocoder, getWeather, getAir} from '../../lib/api'
</jdists>*/
const app = getApp()
let prefetchTimer
let can = false;                       // 是否允许授权标志
let effectInstance;
const CHART_CANVAS_HEIGHT = 272 / 2;
const EFFECT_CANVAS_HEIGHT = 768 / 2;           // 雨雪效果宽度
let isUpdata = false;
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
    success: ({ authSetting }) => {
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
        let { latitude, longitude } = res
        let { lat, lon } = this.data;
        if (latitude == lat && lon == longitude) {
          this.getWeatherData()
        } else {
          this.updateLocation(res)
        }
      }
    })
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
    // console.log(lat, lon)
    // 先传默认的经纬度
    // console.log('lat, lon', lat, lon)
    getWeather(lat, lon)
      .then((res) => {
        console.log('res.result', res.result)
        wx.hideLoading()
        if (typeof cb === 'function') {
          cb()
        }
        if (res.result) {
          console.log('res.result:', res.result)          
          this.render(res.result);
        } else {
          console.log('fail')
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
    //  或群签到的心情
    getMood(province, city, county, (res) => {
      let result = (res.data || {}).data;
      if (result && result.tips) {
        let tips = result.tips.observe;
        let index = Math.floor(Math.random() * Object.keys(tips).length);
        tips = tips[index];
        this.setData({ tips })
      }
    })
  },
  // 数据处理
  render(data) {
    // 全局定义了upData 
    isUpdata = true;
    const { width, scale } = this.data;
    const { hourly, daily, current, lifeStyle, oneWord = '', effect} = data;
    const { backgroundColor, backgroundImage } = current;
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
    // this.stopEffect()
    // if (effect && effect.name) {
    //   effectInstance = drawEffect('effect', effect.name, width, EFFECT_CANVAS_HEIGHT * scale, effect.amount)
    // }
    //  延时画图
    this.drawChart()
    // 缓存数据
    this.dataCache();
    // 启动预取定时器
    this._setPrefetchTimer(10e3);
  },

  // 当第二天的数据不存在时
  dataCache() {
    const { current, backgroundImage, backgroundColor, today, tomorrow, address, tips, hourlyData } = this.data;
    wx.setStorage({
      key: 'defaultData',
      data: {
        current,
        backgroundColor,
        backgroundImage,
        today,
        tomorrow,
        address,
        tips,
        hourlyData
      }
    })
  },
  setDataFormCache() {
    wx.getStorage({
      key: 'defaultData',
      success: ({ data }) => {
        // 判断是否更新了
        if (data || !isUpdata) {
          // 存在并且没有获取数据成功，那么可以给首屏赋值上次数据
          const { current, backgroundImage, backgroundColor, today, tomorrow, address, tips, hourlyData } = data;
          this.setData({
            current,
            backgroundColor,
            backgroundImage,
            today,
            tomorrow,
            address,
            tips,
            hourlyData
          })
        }
      }
    })
  },
  //  赋值，， 默认值
  _setPrefetchTimer(delay = 10e3) {
    // 10s 预取
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const data = app.globalData[`diary-${year}-${month}`] || [];
    if (!data.length && isUpdata) {
      prefetchTimer = setTimeout(() => {
        this.prefetch()
      }, delay)
    }
  },
  prefetch() {
    let openid = wx.getStorageSync('openid');
    if (openid) {
      // 存在则预取当前时间的心情
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      getEmotionByOpenidAndDate(openid, year, month)
        .then((r) => {
          const data = r.data || [];
          app.globalData[`diary-${year}-${month}`] = data;
          console.log('globalData', app.globalData)
        })
        .catch((e) => {})
    }
  },
  // chart 画图
  // 直接用不用看， 以后有涉及就临时看
  drawChart() {
    console.log('cahrt')
    const { width, scale, weeklyData } = this.data;
    let height = CHART_CANVAS_HEIGHT * scale;
    let ctx = wx.createCanvasContext('chart');
    fixChart(ctx, width, height)

    // 添加温度
    Chart.pluginService.register({
      afterDatasetsDraw(e, t) {
        ctx.setTextAlign('center')
        ctx.setTextBaseline('middle')
        ctx.setFontSize(16)

        e.data.datasets.forEach((t, a) => {
          let r = e.getDatasetMeta(a)
          r.hidden ||
            r.data.forEach((e, r) => {
              // 昨天数据发灰
              ctx.setFillStyle(r === 0 ? '#e0e0e0' : '#ffffff')

              let i = t.data[r].toString() + '\xb0'
              let o = e.tooltipPosition()
              0 == a ? ctx.fillText(i, o.x + 2, o.y - 8 - 10) : 1 == a && ctx.fillText(i, o.x + 2, o.y + 8 + 10)
            })
        })
      }
    })
    return new Chart(ctx, getChartConfig(weeklyData))
  },
  stopEffect() {
    if (effectInstance && effectInstance.clear) {
      effectInstance.clear()
    }
  },
  onShow() {
    // 提前获取， 防止网络延迟然后数据获取慢
    this._setPrefetchTimer();
    // console.log('globalData', app.globalData)
  },
  onLoad() {
    // 获取系统信息
    // 用于系统适配
    this.stopEffect()
    effectInstance = drawEffect('effect', 'rain', this.data.width, EFFECT_CANVAS_HEIGHT * this.data.scale, 100)    
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
      // 如果不是从分享的地方过来
      this.setDataFormCache()
      this.getLocation()
    }
  },
  onHide(){
    // 清除定时器
    clearTimeout(prefetchTimer);
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
  },
})