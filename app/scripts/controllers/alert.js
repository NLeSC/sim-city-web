(function(){

'use strict';

angular.module('simCityWebApp')
  .controller('AlertCtrl', AlertController);

AlertController.$inject = ['AlertService', '$timeout'];
function AlertController(AlertService, $timeout) {
  var vm = this;
  vm.alerts = AlertService.alerts;
  vm.dismiss = dismiss;
  vm.initiate = initiate;

  function dismiss(alert) {
    alert.initiated = false;
    $timeout(function() { AlertService.remove(alert.index); }, 1000);
  }

  function initiate(alert) {
    $timeout(function() { alert.initiated = true; }, 100);
  }
}

})();
