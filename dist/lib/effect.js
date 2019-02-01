'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//  雨雪效果的实现
var STATUS_STOP = 'stop';
var STATUS_RUNNING = 'running';

var Particle = function () {
  function Particle(ctx, width, height, opts) {
    _classCallCheck(this, Particle);

    // 定时器
    this._timer = null;
    this._options = opts || {};
    this.ctx = ctx;
    this.status = STATUS_STOP;
    this.w = width;
    this.h = height;
    // 初始化
    this._init();
  }
  // 实例化时第一执行的方法；空，由子类具体实现


  _createClass(Particle, [{
    key: '_init',
    value: function _init() {}
    // 每个动效周期内画图用的方法；空，由子类具体实现

  }, {
    key: '_draw',
    value: function _draw() {}
  }, {
    key: 'run',
    value: function run() {
      var _this = this;

      if (this.status !== STATUS_RUNNING) {
        // console.log('run')
        this.status = STATUS_RUNNING;
        this._timer = setInterval(function () {
          _this._draw();
        }, 30);
      }
      return this;
    }
  }, {
    key: 'stop',
    value: function stop() {
      console.log('stop');
      this.status = STATUS_STOP;
      clearInterval(this._timer);
      return this;
    }
  }, {
    key: 'clear',
    value: function clear() {
      console.log('clear');
      this.stop();
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.ctx.draw();
      return this;
    }
  }]);

  return Particle;
}();
/**
 *  xs、ys 分别代表 x、y 方向上的加速度 
 * params x、y 代表单个粒子的位置，
 * 即雨滴开始绘图的位置  即雨滴的下落速度和角度  
 *  l 代表雨滴的长度
 */


var Rain = function (_Particle) {
  _inherits(Rain, _Particle);

  function Rain() {
    _classCallCheck(this, Rain);

    return _possibleConstructorReturn(this, (Rain.__proto__ || Object.getPrototypeOf(Rain)).apply(this, arguments));
  }

  _createClass(Rain, [{
    key: '_init',

    // 继承
    value: function _init() {
      var ctx = this.ctx;
      ctx.setLineWidth(2);
      ctx.setLineCap('round');
      var h = this.h;
      var w = this.w;
      var i = void 0;
      var amount = this._options.amount || 100;
      var speedFactor = this._options.speedFactor || 0.03;
      var speed = speedFactor * h;
      var ps = this.particles = [];
      for (i = 0; i < amount; i++) {
        var p = {
          x: Math.random() * w,
          y: Math.random() * h,
          l: 2 * Math.random(),
          xs: -1,
          ys: 10 * Math.random() + speed,
          color: 'rgba(255, 255, 255, 0.1)'
        };
        ps.push(p);
      }
    }
  }, {
    key: '_update',
    value: function _update() {
      var w = this.w,
          h = this.h;

      for (var ps = this.particles, i = 0; i < ps.length; i++) {
        var s = ps[i];
        s.x += s.xs;
        s.y += s.ys;
        // 重复利用
        // 也就是当雨滴落出区域后
        if (s.x > w || s.y > h) {
          s.x = Math.random() * w;
          s.y = -10;
        }
      }
      console.log('this', this);
      return this;
    }
  }, {
    key: '_draw',
    value: function _draw() {
      var ps = this.particles;
      var ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      for (var i = 0; i < ps.length; i++) {
        var s = ps[i];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.l * s.xs, s.y + s.l * s.ys);
        ctx.setStrokeStyle(s.color);
        ctx.stroke();
      }
      //把雨滴排序后再画图
      ctx.draw();
      // 更新， 就是让雨滴动起来
      return this._update();
    }
  }]);

  return Rain;
}(Particle);

var Star = function (_Particle2) {
  _inherits(Star, _Particle2);

  function Star() {
    _classCallCheck(this, Star);

    return _possibleConstructorReturn(this, (Star.__proto__ || Object.getPrototypeOf(Star)).apply(this, arguments));
  }

  _createClass(Star, [{
    key: '_init',
    value: function _init() {
      var amount = this._options.amount || 100;
      var ps = this.particles = [];
      for (var i = 0; i < amount; i++) {
        ps.push(this._getStarOptions());
      }
    }
  }, {
    key: '_draw',
    value: function _draw() {
      var ps = this.particles;
      var ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      for (var i = 0; i < ps.length; i++) {
        var _ps$i = ps[i],
            x = _ps$i.x,
            y = _ps$i.y,
            r = _ps$i.r,
            blur = _ps$i.blur,
            opacity = _ps$i.opacity,
            color = _ps$i.color;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.setFillStyle('rgba(' + color + ',' + opacity + ')');
        ctx.shadowColor = 'rgba(' + color + ',' + opacity + ')';
        ctx.shadowBlur = blur;
        ctx.fill();
        ctx.closePath();
        ps[i].opacity = 1;
      }
      ctx.draw();
      this._update();
    }
    //  星星参数

  }, {
    key: '_getStarOptions',
    value: function _getStarOptions() {
      var w = this.w,
          h = this.h;

      var radius = this._options.radius || 2;
      var MAX_BLUR = radius * 10;
      var MIN_BLUR = 0.1;
      var RGB_PROB = 5;
      var RGB_COLR = [255, 255, 255]; //default color
      var MAX_COLR = [255, 255, 0]; //color max
      var MIN_COLR = [255, 0, 0];
      var x = Math.random() * w;
      var y = Math.random() * h / 5;
      return {
        x: x,
        y: y,
        opacity: 1,
        blur: Math.random() * (MAX_BLUR - MIN_BLUR) + MIN_BLUR,
        r: Math.floor(Math.random() * (radius + 0.5) + 0.5),
        color: (Math.random() <= RGB_PROB / 100 ? [Math.round(Math.random() * (MAX_COLR[0] - MIN_COLR[0]) + MIN_COLR[0]), Math.round(Math.random() * (MAX_COLR[1] - MIN_COLR[1]) + MIN_COLR[1]), Math.round(Math.random() * (MAX_COLR[2] - MIN_COLR[2]) + MIN_COLR[2])] : RGB_COLR).join(',')
      };
    }
  }, {
    key: '_update',
    value: function _update() {
      var INN_FADE = 30; //fade in %
      var OUT_FADE = 50;
      var amount = this._options.amount;
      var innPrc = void 0,
          outPrc = void 0;
      var ps = this.particles;
      // 取出重新插入队尾
      var select = ps.splice(0, Math.floor(ps.length / 50));
      for (var i = 0; i < select.length; i++) {
        ps.push(this._getStarOptions());
      }
      for (var _i = 0; _i < ps.length; _i++) {
        var p = ps[_i];
        innPrc = INN_FADE * amount / 100;
        outPrc = OUT_FADE * amount / 100;
        if (_i < outPrc) {
          p.opacity = _i / outPrc;
        } else if (_i > amount - innPrc) {
          p.opacity -= (_i - (amount - innPrc)) / innPrc;
        }
      }
    }
  }]);

  return Star;
}(Particle);

var Snow = function (_Particle3) {
  _inherits(Snow, _Particle3);

  function Snow() {
    _classCallCheck(this, Snow);

    return _possibleConstructorReturn(this, (Snow.__proto__ || Object.getPrototypeOf(Snow)).apply(this, arguments));
  }

  _createClass(Snow, [{
    key: '_init',
    value: function _init() {
      var w = this.w,
          h = this.h;

      var colors = this._options._colors || ['#ccc', '#eee', '#fff', '#ddd'];
      var amount = this._options.amount || 100;
      var speedFactor = this._options.speedFactor || 0.03;
      var speed = speedFactor * h * 0.15;
      var radius = this._options.radius || 2;
      var ps = this.particles = [];
      for (var i = 0; i < amount; i++) {
        var x = Math.random() * w;
        var y = Math.random() * h;
        // console.log(x, y)
        ps.push({
          x: x,
          y: y,
          ox: x,
          ys: Math.random() + speed,
          r: Math.floor(Math.random() * (radius + 0.5) + 0.5),
          color: colors[Math.floor(Math.random() * colors.length)],
          rs: Math.random() * 80
        });
      }
    }
  }, {
    key: '_draw',
    value: function _draw() {
      var ps = this.particles;
      var ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      for (var i = 0; i < ps.length; i++) {
        var _ps$i2 = ps[i],
            x = _ps$i2.x,
            y = _ps$i2.y,
            r = _ps$i2.r,
            color = _ps$i2.color;

        ctx.beginPath();
        // console.log(x,y)
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.setFillStyle(color);
        ctx.fill();
        ctx.closePath();
      }
      ctx.draw();
      this._update();
    }
  }, {
    key: '_update',
    value: function _update() {
      var w = this.w,
          h = this.h;

      var v = this._options.speedFactor / 10;
      for (var ps = this.particles, i = 0; i < ps.length; i++) {
        var p = ps[i];
        var ox = p.ox,
            ys = p.ys;

        p.rs += v;
        p.x = ox + Math.cos(p.rs) * w / 2;
        p.y += ys;
        // console.log(ys)
        // 重复利用
        if (p.x > w || p.y > h) {
          p.x = Math.random() * w;
          p.y = -10;
        }
      }
    }
  }]);

  return Snow;
}(Particle);

exports.default = function (ParticleName, id, width, height, opts) {
  switch (ParticleName.toLowerCase()) {
    case 'rain':
      return new Rain(id, width, height, opts);
    case 'snow':
      return new Snow(id, width, height, opts);
    case 'star':
      return new Star(id, width, height, opts);
  }
};
//# sourceMappingURL=effect.js.map
