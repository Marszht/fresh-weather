// 真正api 文件
import Promise from './bluebird'

// 初始化云函数环境
wx.cloud.init({
  env: 'fresh-weather-34df96'
})
const db = wx.cloud.database();

// 根据openid 和 日期获取月份相应签到日期的颜色
export const getEmotionByOpenidAndDate = (openid, year, month) => {
  const _ = db.command  // 取指令
  year = parseInt(year)
  month = parseInt(month)
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  const curDay = now.getDate();
  let start = new Date(year, month - 1, 1).getTime();
  let end = new Date(year, month, 1).getTime();
  // console.log(curYear, curDay, curMonth)
  if (month - 1 === curMonth && curDay <= 20 && year === curYear) {
    // 如果是当前月份并且天数少于20，那么就一次取出
    return db
      .collection('diary')
      .where({
        openid,
        tsModified: _.gte(start).and(_.lt(end))
      })
      .get()
  }
  // 这里因为限制 limit20，所以查询两次，一共31条（最多31天）记录
  return new Promise((resolve, reject) => {
    Promise.all([
      db
        .collection('diary')
        .where({
          openid,
          tsModified: _.gte(start).and(_.lt(end))
        })
        .orderBy('tsModified', 'desc')
        .limit(15)
        .get(),
        db
          .collection('diary')
          .where({
            openid,
            tsModified: _.gte(start).and(_.lt(end))
          })
          .orderBy('tsMOdified', 'asc')
          .limit(16)
          .get()
    ])
      .then((data) => {
        let [data1, data2] = data;
        let set = new Set()
        data1 = data1.data || []
        data2 = data2.data || []
        // 把这两个月的链接起来
        data = data1.concat(data2).filter((v) => {
          if (set.has(v._id)) {
            return false
          }
          set.add(v._id)
          return true
        })
        resolve({data})
      })
      .catch((e) => {
        reject(e)
      })
  })  
}

// 增加一条数据， 传参openid & emotion
export const addEmotion = (openid, emotion) => {
  return db.collection('diary').add({
    data: {
      openid,
      emotion,
      tsModified: Date.now()
    }
  })
}
/**
 * 获取空气数据
 * @param {*} lat
 * @param {*} lon
 */
export const getWeather = (lat, lon) => {
  return wx.cloud.callFunction({
    name: 'he-weather',
    data: {
      lat,
      lon
    }
  })
}

/**
 * 空气质量
 * @param {*} city
 */
export const getAir = (city) => {
  return wx.cloud.callFunction({
    name: 'he-air',
    data: {
      city
    }
  })
}

