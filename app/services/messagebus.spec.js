
'use strict';

describe('utils.messagebus', function() {

  // load the module
  beforeEach(module('simCityWebApp'));

  var messagebus;
  beforeEach(function() {
    inject(function(_MessageBus_) {
      messagebus = _MessageBus_;
    });
  });

  it('should call subscriber when publication occurs', function() {
    var data = '';
    var subscriber = function(event, _data_) {
      data = _data_;
    };
    var unsubscriber = messagebus.subscribe('someevent', subscriber);

    messagebus.publish('someevent', 'someargs');

    expect(data).toBe('someargs');

    unsubscriber();
  });

});
