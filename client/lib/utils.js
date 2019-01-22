//  一个时间格式化函数， 一般放在utils中
export const dateFormat = (d, pattern = 'yyyy-MM-dd') => {
  let y = d.getFullYear().toString(),
  o = {
    M: d.getMonth() + 1,
    d: d.getDate(),
    h: d.getHours(), //hour
    m: d.getMinutes(), //minute
    s: d.getSeconds() //second
  };
  pattern = pattern.replace(/(y+)/gi, function(a, b) {
    return y.substr(4 - Math.min(4, b.length))
  })
  for (let i in o) {
    pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
      return o[i] < 10 && b.length > 1 ? '0' + o[i] : o[i];
    })
  }
  return pattern;
}