const API_URL = 'https://api.weixin.qq.com/sns/jscode2session'
const request = require('request')
const querystring = require('querystring')
const path = require('path')
const crypto = require('crypto')
const KEY = 'ec499d965b6f4f268f8e3ec754cf75d9'    // 密钥
const USER_ID = 'HE1809131857411294'             // 用户id
// 小程序appid和密钥
const WECHAT_APPID = 'wxd54090c679055f42'
const WECHAT_APP_SECRET = 'f9047a4227dd04be07c81de3dc444425'
// 接口的各种参数提供
const $ = {
  getWechatAppConfig: () => {
    return {
      id: WECHAT_APPID,
      sk: WECHAT_APP_SECRET
    }
  },
  // 用的自己一个签名
  generateSignature: (params) => {
    params.username = USER_ID
    let data =
      Object.keys(params)
        .filter((key) => {
          return params[key] !== '' && key !== 'sign' && key !== 'key'
        })
        .sort()
        .map((key) => {
          return `${key}=${params[key]}`
        })
        .join('&') + KEY
    return crypto.createHash('md5').update(data).digest('base64')
  },
  airBackgroundColor: (aqi) => {
    if (aqi < 50) {
      return '#00cf9a'
    } else if (aqi < 100) {
      return '#00cf9a'
    } else if (aqi < 200) {
      return '#4295f4'
    } else if (aqi > 300) {
      return '#ff6600'
    }
  },
  _isNight: (now, sunrise, sunset) => {
    sunrise = parseInt(sunrise) + 1
    sunset = parseInt(sunset)
    let isNight = false
    if (now > sunset) {
      isNight = true
    } else if (now < sunrise) {
      isNight = false
    }
    return isNight
  },
  _now: (data, _data) => {
    let {fl, wind_dir, wind_sc, hum, cond_txt, cond_code} = data
    let {sr, ss} = _data.daily_forecast[0]
    // 因为是ut时间 所以加 8个小时
    let hours = new Date().getUTCHours() + 8
    if (hours > 24) {
      hours -= 24
    }
    let isNight = $._isNight(hours, sr, ss)
    // 暂时不用
    // let name = $.getWeatherName(cond_code)
    return {
      // backgroundImage: $.getBackgroundImage(name, isNight),
      temp: fl,
      wind: wind_dir,
      windLevel: wind_sc,
      weather: cond_txt,
      humidity: hum,
      ts: _data.update.loc             // 时间
    }
  },
  // 处理接口数据
  handlerData: (data) => {
    if (data && data.HeWeather6 && data.HeWeather6[0].now) {
      let result = data.HeWeather6[0]
      let {now, daily_forecast, lifestyle, hourly} = result
      return {
        status: 0,
        current: $._now(now, result)
      }
    } else {
      return {
        status: 500,
        msg: data.HeWeather6.status
      }
    }
  }
}
exports.main = async (event) => {
  let {code} = event;
  let {id, sk} = $.getWechatAppConfig();
  const data = {
    appid: id,
    secret: sk,
    js_code: code,
    grant_type: 'authorization_code'
  };
  let url = API_URL + '?' + querystring.stringify(data)
  console.log('jscodeurl', url)
  return new Promise((resolve, reject) => {
    request.get(url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error)
      } else {
        try{
          const r = JSON.parse(body)
          console.log(r)
          resolve(r)
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}
