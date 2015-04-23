
describe('The bytes filter', function () {
  'use strict';

  var $filter;

  beforeEach(function () {
    module('simCityWebApp');

    inject(function (_$filter_) {
      $filter = _$filter_;
    });
  });

  it('should produce byte magnitude', function () {
    expect($filter('bytes')(1)).toEqual('0.0 kB');
    expect($filter('bytes')(1000)).toEqual('1.0 kB');
    expect($filter('bytes')(3333)).toEqual('3.3 kB');
    expect($filter('bytes')(6666)).toEqual('6.7 kB');
    expect($filter('bytes')(1000000)).toEqual('1.0 MB');
    expect($filter('bytes')(1000000000)).toEqual('1.0 GB');
    expect($filter('bytes')(1000000000000)).toEqual('1.0 TB');
  });
  it('should produce byte precision', function () {
    expect($filter('bytes')(1234, 0)).toEqual('1 kB');
    expect($filter('bytes')(1500, 0)).toEqual('2 kB');
    expect($filter('bytes')(1234, 1)).toEqual('1.2 kB');
    expect($filter('bytes')(1234, 2)).toEqual('1.23 kB');
    expect($filter('bytes')(1234, 3)).toEqual('1.234 kB');
  });
});
