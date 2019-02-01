'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawEffect = exports.getChartData = exports.getChartConfig = exports.fixChart = exports.dateFormat = undefined;

var _effect = require('../lib/effect');

var _effect2 = _interopRequireDefault(_effect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  一个时间格式化函数， 一般放在utils中
var dateFormat = exports.dateFormat = function dateFormat(d) {
  var pattern = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'yyyy-MM-dd';

  var y = d.getFullYear().toString(),
      o = {
    M: d.getMonth() + 1,
    d: d.getDate(),
    h: d.getHours(), //hour
    m: d.getMinutes(), //minute
    s: d.getSeconds() //second
  };
  pattern = pattern.replace(/(y+)/gi, function (a, b) {
    return y.substr(4 - Math.min(4, b.length));
  });

  var _loop = function _loop(i) {
    pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function (a, b) {
      return o[i] < 10 && b.length > 1 ? '0' + o[i] : o[i];
    });
  };

  for (var i in o) {
    _loop(i);
  }
  return pattern;
};
var fixChart = exports.fixChart = function fixChart(ctx, width, height) {
  ctx.devicePixelRatio = 1;
  if (width < 305) {
    ctx.measureText = function (str) {
      //  为了小屏手机
      var lg = ('' + str).length;
      lg = lg * 5;
      return {
        width: lg
      };
    };
  }
  ctx.measureTextXscale = function (str) {
    var lg = realLength('' + str);
    return {
      width: lg
    };
  };
  ctx.measureTextToolTip = function (str) {
    var lg = realLength('' + str);
    return {
      width: lg * 5.95
    };
  };
  ctx.canvas = {
    // 微信小程序没有canvas 对象， 我们造一个
    width: width,
    height: height
  };
  ctx.canvas.style = {
    width: width,
    height: height,
    display: 'block'
  };
  ctx.canvas.getAttribute = function (name) {
    if (name == 'width') {
      return ctx.canvas.width;
    };
    if (name == 'height') {
      return ctx.canvas.width;
    }
  };
};
var getChartConfig = exports.getChartConfig = function getChartConfig(data) {
  data = getChartData(data);
  var lineData = {
    labels: data.dates,
    datasets: [{
      data: data.maxData,
      fill: false,
      borderWidth: 2,
      borderColor: '#FFB74D',
      pointStyle: 'circle',
      pointRadius: 3,
      ponitBackgroundColor: '#FFB74D',
      ponitBorderWidth: 1,
      lineTension: 0.5
    }, {
      data: data.minData,
      fill: false,
      borderWidth: 2,
      borderColor: '#4FC3F7',
      pointStyle: 'circle',
      pointRadius: 3,
      pointBackgroundColor: '#4FC3F7',
      pointBorderWidth: 1,
      lineTension: 0.5
    }]
  };
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
        yAxes: [{
          display: false
        }],
        xAxes: [{
          display: false
        }]
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
  };
};
var getChartData = exports.getChartData = function getChartData(data) {
  var dates = [],
      maxData = [],
      minData = [];
  if (data && data.length) {
    data.forEach(function (_ref) {
      var date = _ref.date,
          maxTemp = _ref.maxTemp,
          minTemp = _ref.minTemp;

      dates.push(date);
      maxData.push(maxTemp);
      minData.push(minTemp);
    });
  }
  return {
    dates: dates,
    maxData: maxData,
    minData: minData
  };
};
var drawEffect = exports.drawEffect = function drawEffect(canvasId, name, width, height, amount) {
  var rain = (0, _effect2.default)(name, wx.createCanvasContext(canvasId), width, height, {
    amount: amount || 100,
    speedFactor: 0.03
  });
  return rain.run();
};
//# sourceMappingURL=utils.js.map
