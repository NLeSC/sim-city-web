(function(){
'use strict';

angular.module('simCityWebApp').
  service('AlertService', AlertService);

AlertService.$inject = [];
function AlertService() {
  var vm = this;
  vm.add = add;
  vm.alerts = [];
  vm.clear = clear;
  vm.currentIndex = 0;
  vm.remove = remove;

  function add(type, message) {
    var index = vm.currentIndex++;
    var alert = {index: index, type: type, message: message};
    vm.alerts.push(alert);
    return alert;
  }
  function remove(idx) {
    if (vm.alerts.length > 0) {
      var alert = vm.alerts.map(getIndex).indexOf(idx);
      if (alert !== -1) {
        return vm.alerts.splice(alert, 1)[0];
      }
    }
  }
  function clear() {
    // don't assign new array: we keep references around.
    vm.alerts.length = 0;
  }
}

function getIndex(value) {
  return value.index;
}

})();
