(function(){
'use strict';

angular.module('simCityWebApp').
  factory('RangeFactory', RangeFactory);

RangeFactory.$inject = [];
function RangeFactory() {
  return {
    colorConverter: function(minValue, maxValue, minHue, maxHue, bins, outputConstructor) {
      var converter = new RangeConverter(minValue, maxValue, minHue, maxHue);

      this.values = [];

      this.convert = function(value) {
        var idx = Math.floor(bins * (value - minValue) / (maxValue - minValue));
        idx = Math.max(0, Math.min(bins, idx));
        return this.values[idx];
      };

      var binsize = Math.floor((maxValue - minValue) / bins);
      var binExtra = (maxValue - minValue) % bins;
      var idx = minValue;
      for (var i = 0; i <= bins; i++) {
        var hue = converter.convert(idx);
        var rgb = hsvToRgb(hue, 1, 1);
        var output = rgbToHex(rgb.r, rgb.g, rgb.b);

        this.values.push(outputConstructor(output));
        idx += binsize;
        if (i < binExtra) {
          idx += 1;
        }
      }
    },
    rangeConverter: RangeConverter,
  };
}

function RangeConverter(minValue, maxValue, fromRange, toRange) {
  this.convert = function(value) {
    var fraction = (value - minValue) / (maxValue - minValue);
    if (fraction > 1) {
      fraction = 1;
    } else if (fraction < 0) {
      fraction = 0;
    }
    return fraction * (toRange - fromRange) + fromRange;
  };
}

function hsvToRgb(h, s, v) {
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
    };
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

})();
