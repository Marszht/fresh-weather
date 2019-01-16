const API_URL = 'https://free-api.heweather.com/s6/air/now';
const request = require('request');
/*<jdists import="../../inline/utils.js" />*/


/*<remove>*/
const $ = require('../../inline/utils')
/*</remove>*/

exports.main = async (event) => {
  let location = event.city;
  let params = {
    location,
    t: Math.floor(Date.now() / 1e3),
    unit: 'm'
  }
  // 生成签名
  params.sign = $.generateSignature(params)
  let query = []
  for (let i in params) {
    query.push(`${i}=${encodeURIComponent(params[i])}`)
  }
  let url = API_URL + '?' + query.join('&')
  console.log('url', url);
  return new Promise((resolve, reject) => {
    request.get(url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error);
      } else {
        try {
          let data = JSON.parse(body);
          if (data && data.HeWeather6 && data.HeWeather6[0].air_now_city) {
            let {aqi, qlty} = data.HeWeather6[0].air_now_city;
            resolve({
              status: 0,
              aqi,
              // color:
              name: qlty
            })
          } else {
            resolve({
              status: 500
            })
          }
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}