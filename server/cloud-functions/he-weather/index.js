const API_URL = 'https://free-api.heweather.com/s6/weather'

const request = require('request')

/*<jdists import="../../inline/utils.js" />*/

/*<remove>*/
const $ = require('../../inline/utils')
/*</remove>*/

exports.main = async (event) => {
  const {lat, lon} = event
  let location = `${lat},${lon}`
  let params = {
    location,
    t: Math.floor(Date.now() / 1e3),
    unit: 'm'
  }
  // 生成签名 数字签名
  params.sign = $.generateSignature(params)
  let query = []
  for (let i in params) {
    query.push(`${i}=${encodeURIComponent(params[i])}`)
  }
  let url = API_URL + '?' + query.join('&')
  console.log('url', url)
  return new Promise((resolve, reject) => {
    request.get(url, (error, responce, body) => {
      if (error || responce.statusCode !== 200) {
        reject(error)
      } else {
        try {
          // console.log('JSON.parse(body)', JSON.parse(body))
          let rs = $.handlerData(JSON.parse(body))
          // 执行了 ?
          // console.log('rs', rs)
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}