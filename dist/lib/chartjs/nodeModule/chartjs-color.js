'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* MIT license */
var convert = require('./color-convert');
var string = require('./chartjs-color-string');
var Color = function Color(obj) {
	if (obj instanceof Color) {
		return obj;
	}
	if (!(this instanceof Color)) {
		return new Color(obj);
	}
	this.values = {
		rgb: [0, 0, 0],
		hsl: [0, 0, 0],
		hsv: [0, 0, 0],
		hwb: [0, 0, 0],
		cmyk: [0, 0, 0, 0],
		alpha: 1
	};
	// parse Color() argument
	var vals;
	if (typeof obj === 'string') {
		vals = string.getRgba(obj);
		if (vals) {
			this.setValues('rgb', vals);
		} else if (vals = string.getHsla(obj)) {
			this.setValues('hsl', vals);
		} else if (vals = string.getHwb(obj)) {
			this.setValues('hwb', vals);
		} else {
			throw new Error('Unable to parse color from string "' + obj + '"');
		}
	} else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
		vals = obj;
		if (vals.r !== undefined || vals.red !== undefined) {
			this.setValues('rgb', vals);
		} else if (vals.l !== undefined || vals.lightness !== undefined) {
			this.setValues('hsl', vals);
		} else if (vals.v !== undefined || vals.value !== undefined) {
			this.setValues('hsv', vals);
		} else if (vals.w !== undefined || vals.whiteness !== undefined) {
			this.setValues('hwb', vals);
		} else if (vals.c !== undefined || vals.cyan !== undefined) {
			this.setValues('cmyk', vals);
		} else {
			throw new Error('Unable to parse color from object ' + JSON.stringify(obj));
		}
	}
};
Color.prototype = {
	rgb: function rgb() {
		return this.setSpace('rgb', arguments);
	},
	hsl: function hsl() {
		return this.setSpace('hsl', arguments);
	},
	hsv: function hsv() {
		return this.setSpace('hsv', arguments);
	},
	hwb: function hwb() {
		return this.setSpace('hwb', arguments);
	},
	cmyk: function cmyk() {
		return this.setSpace('cmyk', arguments);
	},
	rgbArray: function rgbArray() {
		return this.values.rgb;
	},
	hslArray: function hslArray() {
		return this.values.hsl;
	},
	hsvArray: function hsvArray() {
		return this.values.hsv;
	},
	hwbArray: function hwbArray() {
		var values = this.values;
		if (values.alpha !== 1) {
			return values.hwb.concat([values.alpha]);
		}
		return values.hwb;
	},
	cmykArray: function cmykArray() {
		return this.values.cmyk;
	},
	rgbaArray: function rgbaArray() {
		var values = this.values;
		return values.rgb.concat([values.alpha]);
	},
	hslaArray: function hslaArray() {
		var values = this.values;
		return values.hsl.concat([values.alpha]);
	},
	alpha: function alpha(val) {
		if (val === undefined) {
			return this.values.alpha;
		}
		this.setValues('alpha', val);
		return this;
	},
	red: function red(val) {
		return this.setChannel('rgb', 0, val);
	},
	green: function green(val) {
		return this.setChannel('rgb', 1, val);
	},
	blue: function blue(val) {
		return this.setChannel('rgb', 2, val);
	},
	hue: function hue(val) {
		if (val) {
			val %= 360;
			val = val < 0 ? 360 + val : val;
		}
		return this.setChannel('hsl', 0, val);
	},
	saturation: function saturation(val) {
		return this.setChannel('hsl', 1, val);
	},
	lightness: function lightness(val) {
		return this.setChannel('hsl', 2, val);
	},
	saturationv: function saturationv(val) {
		return this.setChannel('hsv', 1, val);
	},
	whiteness: function whiteness(val) {
		return this.setChannel('hwb', 1, val);
	},
	blackness: function blackness(val) {
		return this.setChannel('hwb', 2, val);
	},
	value: function value(val) {
		return this.setChannel('hsv', 2, val);
	},
	cyan: function cyan(val) {
		return this.setChannel('cmyk', 0, val);
	},
	magenta: function magenta(val) {
		return this.setChannel('cmyk', 1, val);
	},
	yellow: function yellow(val) {
		return this.setChannel('cmyk', 2, val);
	},
	black: function black(val) {
		return this.setChannel('cmyk', 3, val);
	},
	hexString: function hexString() {
		return string.hexString(this.values.rgb);
	},
	rgbString: function rgbString() {
		return string.rgbString(this.values.rgb, this.values.alpha);
	},
	rgbaString: function rgbaString() {
		return string.rgbaString(this.values.rgb, this.values.alpha);
	},
	percentString: function percentString() {
		return string.percentString(this.values.rgb, this.values.alpha);
	},
	hslString: function hslString() {
		return string.hslString(this.values.hsl, this.values.alpha);
	},
	hslaString: function hslaString() {
		return string.hslaString(this.values.hsl, this.values.alpha);
	},
	hwbString: function hwbString() {
		return string.hwbString(this.values.hwb, this.values.alpha);
	},
	keyword: function keyword() {
		return string.keyword(this.values.rgb, this.values.alpha);
	},
	rgbNumber: function rgbNumber() {
		var rgb = this.values.rgb;
		return rgb[0] << 16 | rgb[1] << 8 | rgb[2];
	},
	luminosity: function luminosity() {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.values.rgb;
		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
		}
		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},
	contrast: function contrast(color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();
		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}
		return (lum2 + 0.05) / (lum1 + 0.05);
	},
	level: function level(color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}
		return contrastRatio >= 4.5 ? 'AA' : '';
	},
	dark: function dark() {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.values.rgb;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},
	light: function light() {
		return !this.dark();
	},
	negate: function negate() {
		var rgb = [];
		for (var i = 0; i < 3; i++) {
			rgb[i] = 255 - this.values.rgb[i];
		}
		this.setValues('rgb', rgb);
		return this;
	},
	lighten: function lighten(ratio) {
		var hsl = this.values.hsl;
		hsl[2] += hsl[2] * ratio;
		this.setValues('hsl', hsl);
		return this;
	},
	darken: function darken(ratio) {
		var hsl = this.values.hsl;
		hsl[2] -= hsl[2] * ratio;
		this.setValues('hsl', hsl);
		return this;
	},
	saturate: function saturate(ratio) {
		var hsl = this.values.hsl;
		hsl[1] += hsl[1] * ratio;
		this.setValues('hsl', hsl);
		return this;
	},
	desaturate: function desaturate(ratio) {
		var hsl = this.values.hsl;
		hsl[1] -= hsl[1] * ratio;
		this.setValues('hsl', hsl);
		return this;
	},
	whiten: function whiten(ratio) {
		var hwb = this.values.hwb;
		hwb[1] += hwb[1] * ratio;
		this.setValues('hwb', hwb);
		return this;
	},
	blacken: function blacken(ratio) {
		var hwb = this.values.hwb;
		hwb[2] += hwb[2] * ratio;
		this.setValues('hwb', hwb);
		return this;
	},
	greyscale: function greyscale() {
		var rgb = this.values.rgb;
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		this.setValues('rgb', [val, val, val]);
		return this;
	},
	clearer: function clearer(ratio) {
		var alpha = this.values.alpha;
		this.setValues('alpha', alpha - alpha * ratio);
		return this;
	},
	opaquer: function opaquer(ratio) {
		var alpha = this.values.alpha;
		this.setValues('alpha', alpha + alpha * ratio);
		return this;
	},
	rotate: function rotate(degrees) {
		var hsl = this.values.hsl;
		var hue = (hsl[0] + degrees) % 360;
		hsl[0] = hue < 0 ? 360 + hue : hue;
		this.setValues('hsl', hsl);
		return this;
	},
	/**
  * Ported from sass implementation in C
  * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
  */
	mix: function mix(mixinColor, weight) {
		var color1 = this;
		var color2 = mixinColor;
		var p = weight === undefined ? 0.5 : weight;
		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();
		var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;
		return this.rgb(w1 * color1.red() + w2 * color2.red(), w1 * color1.green() + w2 * color2.green(), w1 * color1.blue() + w2 * color2.blue()).alpha(color1.alpha() * p + color2.alpha() * (1 - p));
	},
	toJSON: function toJSON() {
		return this.rgb();
	},
	clone: function clone() {
		// NOTE(SB): using node-clone creates a dependency to Buffer when using browserify,
		// making the final build way to big to embed in Chart.js. So let's do it manually,
		// assuming that values to clone are 1 dimension arrays containing only numbers,
		// except 'alpha' which is a number.
		var result = new Color();
		var source = this.values;
		var target = result.values;
		var value, type;
		for (var prop in source) {
			if (source.hasOwnProperty(prop)) {
				value = source[prop];
				type = {}.toString.call(value);
				if (type === '[object Array]') {
					target[prop] = value.slice(0);
				} else if (type === '[object Number]') {
					target[prop] = value;
				} else {
					console.error('unexpected color value:', value);
				}
			}
		}
		return result;
	}
};
Color.prototype.spaces = {
	rgb: ['red', 'green', 'blue'],
	hsl: ['hue', 'saturation', 'lightness'],
	hsv: ['hue', 'saturation', 'value'],
	hwb: ['hue', 'whiteness', 'blackness'],
	cmyk: ['cyan', 'magenta', 'yellow', 'black']
};
Color.prototype.maxes = {
	rgb: [255, 255, 255],
	hsl: [360, 100, 100],
	hsv: [360, 100, 100],
	hwb: [360, 100, 100],
	cmyk: [100, 100, 100, 100]
};
Color.prototype.getValues = function (space) {
	var values = this.values;
	var vals = {};
	for (var i = 0; i < space.length; i++) {
		vals[space.charAt(i)] = values[space][i];
	}
	if (values.alpha !== 1) {
		vals.a = values.alpha;
	}
	// {r: 255, g: 255, b: 255, a: 0.4}
	return vals;
};
Color.prototype.setValues = function (space, vals) {
	var values = this.values;
	var spaces = this.spaces;
	var maxes = this.maxes;
	var alpha = 1;
	var i;
	if (space === 'alpha') {
		alpha = vals;
	} else if (vals.length) {
		// [10, 10, 10]
		values[space] = vals.slice(0, space.length);
		alpha = vals[space.length];
	} else if (vals[space.charAt(0)] !== undefined) {
		// {r: 10, g: 10, b: 10}
		for (i = 0; i < space.length; i++) {
			values[space][i] = vals[space.charAt(i)];
		}
		alpha = vals.a;
	} else if (vals[spaces[space][0]] !== undefined) {
		// {red: 10, green: 10, blue: 10}
		var chans = spaces[space];
		for (i = 0; i < space.length; i++) {
			values[space][i] = vals[chans[i]];
		}
		alpha = vals.alpha;
	}
	values.alpha = Math.max(0, Math.min(1, alpha === undefined ? values.alpha : alpha));
	if (space === 'alpha') {
		return false;
	}
	var capped;
	// cap values of the space prior converting all values
	for (i = 0; i < space.length; i++) {
		capped = Math.max(0, Math.min(maxes[space][i], values[space][i]));
		values[space][i] = Math.round(capped);
	}
	// convert to all the other color spaces
	for (var sname in spaces) {
		if (sname !== space) {
			values[sname] = convert[space][sname](values[space]);
		}
	}
	return true;
};
Color.prototype.setSpace = function (space, args) {
	var vals = args[0];
	if (vals === undefined) {
		// color.rgb()
		return this.getValues(space);
	}
	// color.rgb(10, 10, 10)
	if (typeof vals === 'number') {
		vals = Array.prototype.slice.call(args);
	}
	this.setValues(space, vals);
	return this;
};
Color.prototype.setChannel = function (space, index, val) {
	var svalues = this.values[space];
	if (val === undefined) {
		// color.red()
		return svalues[index];
	} else if (val === svalues[index]) {
		// color.red(color.red())
		return this;
	}
	// color.red(100)
	svalues[index] = val;
	this.setValues(space, svalues);
	return this;
};
if (typeof window !== 'undefined') {
	window.Color = Color;
}
module.exports = Color;
//# sourceMappingURL=chartjs-color.js.map
