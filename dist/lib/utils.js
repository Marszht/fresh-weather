'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
//# sourceMappingURL=utils.js.map
