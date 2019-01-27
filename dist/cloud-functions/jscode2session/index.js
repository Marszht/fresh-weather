const API_URL = 'https://api.weixin.qq.com/sns/jscode2session'
const request = require('request')
const querystring = require('querystring')
const path = require('path')
const crypto = require('crypto')
/*<remove trigger="prod">*/
const STATIC_SERVER_URL = 'http://127.0.0.1:1314/static/'
/*</remove>*/
const BACKGROUND_PERFIXER = `${STATIC_SERVER_URL}/bg`;
const WEATHER_IMAGE_PERFIXER = `${STATIC_SERVER_URL}/icon`;
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
  // 直接根据函数名来推断函数的功能
  getIconNameByCode(code, isNight) {
    const nightMap = {
      '100': 'qingye',
      '200': 'qingye',
      '201': 'qingye',
      '202': 'qingye',
      '203': 'qingye',
      '204': 'qingye',
      '101': 'duoyunye',
      '102': 'duoyunye',
      '103': 'duoyunye',
      '300': 'zhenyuye',
      '301': 'zhenyuye',
      '302': 'zhenyuye',
      '303': 'zhenyuye',
      '304': 'zhenyuye',
      '305': 'zhenyuye',
      '306': 'zhenyuye',
      '307': 'zhenyuye',
      '308': 'zhenyuye',
      '309': 'zhenyuye',
      '310': 'zhenyuye',
      '311': 'zhenyuye',
      '312': 'zhenyuye',
      '313': 'zhenyuye',
      '314': 'zhenyuye',
      '315': 'zhenyuye',
      '316': 'zhenyuye',
      '399': 'zhenyuye',
      '317': 'zhenyuye',
      '318': 'zhenyuye',
      '400': 'zhenxueye',
      '401': 'zhenxueye',
      '402': 'zhenxueye',
      '403': 'zhenxueye',
      '404': 'zhenxueye',
      '405': 'zhenxueye',
      '406': 'zhenxueye',
      '407': 'zhenxueye',
      '408': 'zhenxueye',
      '409': 'zhenxueye',
      '410': 'zhenxueye',
      '499': 'zhenxueye'
    }
    const dayMap = {
      '100': 'qingbai',
      '101': 'duoyunbai',
      '102': 'duoyunbai',
      '103': 'duoyunbai',
      '104': 'yin',
      '201': 'qingye',
      '202': 'qingye',
      '203': 'qingye',
      '204': 'qingye',
      '205': 'fengli',
      '206': 'fengli',
      '207': 'fengli',
      '208': 'fengli',
      '209': 'yin',
      '210': 'yin',
      '211': 'yin',
      '212': 'yin',
      '213': 'yin',
      '300': 'zhenyubai',
      '301': 'zhenyubai',
      '302': 'leizhenyu',
      '303': 'leizhenyu',
      '304': 'leizhenyuzhuanbingbao',
      '305': 'xiaoyu',
      '306': 'zhongyu',
      '307': 'dayu',
      '308': 'tedabaoyu',
      '309': 'xiaoyu',
      '310': 'baoyu',
      '311': 'dabaoyu',
      '312': 'tedabaoyu',
      '313': 'dongyu',
      '314': 'xiaoyu',
      '315': 'zhongyu',
      '316': 'dayu',
      '317': 'baoyu',
      '318': 'dabaoyu',
      '399': 'xiaoyu',
      '400': 'xiaoxue',
      '401': 'zhongxue',
      '402': 'daxue',
      '403': 'baoxue',
      '404': 'yujiaxue',
      '405': 'yujiaxue',
      '406': 'yujiaxue',
      '407': 'zhenxuebai',
      '408': 'xiaoxue',
      '409': 'zhongxue',
      '410': 'daxue',
      '499': 'xiaoxue',
      '500': 'wu',
      '501': 'wu',
      '502': 'wumaibai',
      '503': 'yangsha',
      '504': 'yangsha',
      '507': 'shachenbao',
      '508': 'qiangshachenbao',
      '509': 'wu',
      '510': 'wu',
      '511': 'wumaibai',
      '512': 'wumaibai',
      '513': 'wumaibai',
      '514': 'wu',
      '515': 'wu',
      '900': 'qingbai',
      '901': 'qingbai',
      '902': 'yin'
    }
    if (isNight && nightMap[code]) {
      return nightMap[code];
    }
    return dayMap[code] ? dayMap[code] : 'yin'
  },
  // 获取天气名称
  getWeatherName(code) {
    code = parseInt(code);
    let result = 'rain'
    if ( code === 100 || (code >= 200 && code <= 204)) {
      result = 'clear';
    } else if (code > 100 && code <= 103) {
      result = 'cloud'
    } else if (code === 104 || (code >= 205 && code <= 208)) {
      result = 'overcast'
    } else if (code >= 302 && code <= 304) {
      result = 'thunder'
    } else if (code >= 400 && code < 500) {
      result = 'snow'
    } else if ((code >= 511 && code <= 513) || code === 502) {
      result = 'smog'
    } else if (code === 501 || (code >= 514 && code <= 515) || (code >= 509 && code <= 510)) {
      // 这个是雾气
      result = 'smog'
    } else if (code >= 503 && code < 508) {
      // 扬沙
      result = 'smog'
    } else if (code >= 900) {
      result = 'clear'
    }
    return result;
  },
  getBackgroundImage(weather, isNight) {
    return BACKGROUND_PERFIXER + '/' + path.join(isNight ? 'night' : 'day', `${weather}.jpg`);
  },
  /**
   * 获取背景颜色
   * @param {} name
   * @param {*} night
   */
  getBackgroundColor(name, night = 'day') {
    name = `${night}_${name}`;
    const map = {
      day_cloud: '62aadc',
      night_cloud: '27446f',
      day_rain: '2f4484',
      night_rain: '284469',
      day_thunder: '3a4482',
      night_thunder: '2a2b5a',
      day_clear: '57b9e2',
      night_clear: '173868',
      day_overcast: '5c7a93',
      night_overcast: '22364d',
      day_snow: '95d1ed',
      night_snow: '7a98bc',
      night_smog: '494d57'
    }
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
  // 判断是否为晚上， 根据接口的传回来的数据， 日出， 日落
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
    let { fl, wind_dir, wind_sc, hum, cond_txt, cond_code } = data
    let { sr, ss } = _data.daily_forecast[0]
    // 因为是ut时间 所以加 8个小时
    let hours = new Date().getUTCHours() + 8
    if (hours > 24) {
      hours -= 24
    }
    let isNight = $._isNight(hours, sr, ss)
    // 暂时不用
    let name = $.getWeatherName(cond_code)
    return {
      backgroundImage: $.getBackgroundImage(name, isNight),
      airBackgroundColor: $.getBackgroundColor(name, isNight ? 'night' : 'day'),
      temp: fl,
      wind: wind_dir,
      windLevel: wind_sc,
      weather: cond_txt,
      humidity: hum,
      ts: _data.update.loc,             // 时间
      icon: $.getIconNameByCode(cond_code, isNight),
    }
  },
  _hourly: (data, _data) => {
    let hourly = [];
    // 日升 日落
    let {sr, ss} = _data.daily_forecast[0];
    for (let i = 0; i< data.length; i++) {
      let r = data [i];
      if (!r || !r.time) {
        break;
      }
      let time = r.time;
      // 只是数字时间，其他 的都丢掉
      let hours = time.slice(11, 13);
      let isNight = $._isNight(hours, sr, ss)
      hourly.push({
        temp: r.temp,
        time: hours + ':00',
        weather: r.cond_txt,
        icon: $.getIconNameByCode(r.cond_code, isNight)
      })
    }
    return hourly;
  },
  _lifestyle: (data) => {
    let arr = [];
    const map = {
      cw: {
        icon: 'xichezhishu',
        name: '洗车'
      },
      sport: {
        icon: 'yundongzhishu',
        name: '运动'
      },
      flu: {
        icon: 'ganmao',
        name: '感冒'
      },
      uv: {
        icon: 'ziwaixian',
        name: '紫外线强度'
      },
      drsg: {
        icon: 'liangshai',
        name: '穿衣'
      },
      air: {
        icon: 'beikouzhao',
        name: '污染扩散'
      },
      trav: {
        icon: 'fangshai',
        name: '旅游'
      },
      comf: {
        icon: 'guominzhishu',
        name: '舒适度'
      }
    }
    data.forEach((v) => {
      let t = map[v.type];
      arr.push({
        name: t.name,
        icon: t.icon,
        info: v.brf,
        detail: v.txt
      })
    })
    return arr;
  },
  _daily: (data) => {
    let weekly = [];
    for (let i = 0; i<= 6; i++) {
      let r = data[i];
      weekly.push({
        day: r.cond_txt_d,
        dayIcon: $.getIconNameByCode(r.cond_code_d),
        dayWind: r.wind_dir,
        dayWindLevel: r.wind_sc,
        maxTemp: r.tmp_max,
        minTemp: r.tmp_min,
        night: r.cond_txt_n,
        nightIcon: $.getIconNameByCode(r.cond_code_n, true),
        nightWind: r.wind_dir,
        nightWindLevel: r.wind_sc,
        time: new Date(r.date).getTime()
      })
    }
    return weekly;
  },
  // 处理接口数据
  handlerData: (data) => {
    if (data && data.HeWeather6 && data.HeWeather6[0].now) {
      let result = data.HeWeather6[0]
      let { now, daily_forecast, lifestyle, hourly } = result
      return {
        status: 0,
        oneWord: $.getOneWord(now.cond_code),
        current: $._now(now, result),
        hourly: $._hourly(hourly, result),
        lifestyle: $._lifestyle(lifestyle),
        daily: $._daily(daily_forecast, result)
      }
    } else {
      return {
        status: 500,
        msg: data.HeWeather6.status
      }
    }
  },
  // 每日一句
  getOneWord(code) {
    const list = [
      '我喜欢陈美珠',
      '生活是天气，有阴有晴有风雨',
      '心怀感恩，幸福常在',
      '心累的时候，换个心情看世界',
      '想获得人生的金子，就必须淘尽生活的沙烁',
      '因为有明天，今天永远只是起跑线',
      '只要心情是晴朗的，人生就没有雨天',
      '有你的城市下雨也美丽',
      '雨划过我窗前，玻璃也在流眼泪',
      '天空澄碧，纤云不染',
      '人生，不要被安逸所控制',
      '在受伤的时候，也能浅浅的微笑',
      '不抱怨过去，不迷茫未来，只感恩现在',
      '生活向前，你向阳光',
      '在阳光中我学会欢笑，在阴云中我学会坚强',
      '希望有情人终成眷属',
      '现实很残酷，但自己一定要快乐'
    ]
    // 随机选一个
    let index = Math.floor(Math.random() * list.length)
    // 这种最好赋默认值
    return list[index] ? list[index] : list[0]
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
  // console.log('jscodeurl', url)
  return new Promise((resolve, reject) => {
    request.get(url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error)
      } else {
        try{
          const r = JSON.parse(body)
          // console.log(r)
          resolve(r)
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}
