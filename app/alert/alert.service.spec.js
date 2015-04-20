(function(){

'use strict';

describe('Service: Alert', function () {

  // load the controller's module
  beforeEach(module('simCityWebApp'));

  var AlertSrv;

  // Initialize the controller and a mock scope
  beforeEach(inject(function () {
    var $injector = angular.injector([ 'simCityWebApp' ]);
    AlertSrv = $injector.get( 'AlertService' );
  }));

  it('should add indexed alerts to its state', function () {
    expect(AlertSrv.add).toBeDefined();
    var alert = AlertSrv.add('error', 'something wrong');
    expect(alert.index).toBe(0);
    expect(alert.type).toBe('error');
    expect(alert.message).toBe('something wrong');
    expect(AlertSrv.alerts[0]).toBe(alert);
    expect(AlertSrv.alerts.length).toBe(1);
    AlertSrv.add('error', 'something wrong');
    expect(AlertSrv.alerts.length).toBe(2);
  });
  it('should remove indexed alerts from its state', function () {
    expect(AlertSrv.remove).toBeDefined();
    AlertSrv.add('error', 'something wrong');
    var alert = AlertSrv.remove(0);
    expect(alert.message).toBe('something wrong');
    expect(AlertSrv.alerts.length).toBe(0);
    expect(AlertSrv.remove).toBeDefined();
    AlertSrv.add('error', 'something wrong');
    AlertSrv.add('error', 'something wrong again');
    AlertSrv.add('error', 'something wrong');
    alert = AlertSrv.remove(2);
    expect(alert.message).toBe('something wrong again');
    expect(AlertSrv.alerts.length).toBe(2);
    expect(AlertSrv.alerts[0].index).toBe(1);
  });
  it('should clear all alerts from its state', function () {
    expect(AlertSrv.clear).toBeDefined();
    AlertSrv.add('error', 'something wrong');
    AlertSrv.clear();
    expect(AlertSrv.alerts.length).toBe(0);
    AlertSrv.add('error', 'something wrong');
    expect(AlertSrv.alerts.length).toBe(1);
    expect(AlertSrv.alerts[0].index).toBe(1);
  });
  it('should clear all alerts from its state', function () {
    expect(AlertSrv.currentIndex).toBeDefined();
    expect(AlertSrv.currentIndex).toBe(0);
    AlertSrv.add('error', 'something wrong');
    expect(AlertSrv.currentIndex).toBe(1);
    AlertSrv.remove(0);
    expect(AlertSrv.currentIndex).toBe(1);
  });
});

})();
