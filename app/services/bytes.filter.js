(function() {
'use strict';

angular.module('simCityWebApp')
  .filter('bytes', bytes);

function bytes() {
  var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];

  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    var number = Math.max(1, Math.floor(Math.log(bytes) / Math.log(1000)));
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    return (bytes / Math.pow(1000, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  };
}

})();
