(function(){

'use strict';

angular.module('simCityWebApp').
  service('MessageBus', ['$rootScope', function ($rootScope) {
  /**
   * Publish an event
   *
   * @param  {String} name     Event name to listen on.
   * @param  {*} args Optional one or more arguments which will be passed onto the event listeners.
   * @return {Object}      Event object
   *
   * @see $rootScope.$emit
   */
  this.publish = function() {
    $rootScope.$emit.apply($rootScope, arguments);
  };
  /**
   * @param  {String} name     Event name to listen on.
   * @param  {Function} listener Function to call when the event is emitted.
   * @return {Function} unsubscribe function
   *
   * @see $rootScope.$on for how listener is called
   */
  this.subscribe = function() {
    $rootScope.$on.apply($rootScope, arguments);
  };
}]);

})();
