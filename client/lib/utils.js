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

export const fixChart = (ctx, width, height) => {
  ctx.devicePixelRatio = 1;
  if (width< 305) {
    ctx.measureText = function(str) {
      //  为了小屏手机
      let lg = ('' + str).length;
      lg = lg * 5
      return {
        width: lg
      }
    }
  }
  ctx.measureTextXscale = function(str) {
    let lg = realLength('' + str);
    return {
      width: lg
    }
  }
  ctx.measureTextToolTip = function(str) {
    let lg = realLength('' + str)
    return {
      width: lg * 5.95
    }
  }
  ctx.canvas = {
    // 微信小程序没有canvas 对象， 我们造一个
    width,
    height
  }
  ctx.canvas.style = {
    width,
    height,
    display: 'block'
  }
  ctx.canvas.getAttribute = function(name) {
    if (name == 'width') {
      return ctx.canvas.width;
    };
    if (name == 'height') {
      return ctx.canvas.width;
    }
  }
}

export const getChartConfig = (data) => {
  data = getChartData(data);
  let lineData = {
    labels: data.dates,
    datasets: [
      {
        data: data.maxData,
        fill: false,
        borderWidth: 2,
        borderColor: '#FFB74D',
        pointStyle: 'circle',
        pointRadius: 3,
        ponitBackgroundColor: '#FFB74D',
        ponitBorderWidth: 1,
        lineTension: 0.5
      },
      {
        data: data.minData,
        fill: false,
        borderWidth: 2,
        borderColor: '#4FC3F7',
        pointStyle: 'circle',
        pointRadius: 3,
        pointBackgroundColor: '#4FC3F7',
        pointBorderWidth: 1,
        lineTension: 0.5
      }
    ]
  }
  return {
    type: 'line',
    data: lineData,
    redraw: true,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      },
      scaleLabel: {
        display: false
      },
      scales: {
        yAxes: [
          {
            display: false
          }
        ],
        xAxes: [
          {
            display: false
          }
        ]
      },
      layout: {
        padding: {
          left: 26,
          right: 26,
          top: 30,
          bottom: 30
        }
      }
    }
  }
}
export const getChartData = (data) => {
  let dates = [],
    maxData = [],
    minData = []

  if (data && data.length) {
    data.forEach(({date, maxTemp, minTemp}) => {
      dates.push(date)
      maxData.push(maxTemp)
      minData.push(minTemp)
    })
  }
  return {
    dates,
    maxData,
    minData
  }
}