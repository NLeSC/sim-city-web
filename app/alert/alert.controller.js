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

  function initiate(alert) {
    $timeout(function() {
      $('.alert-' + alert.index).collapse('show');
      $timeout(function() { vm.dismiss(alert); }, 10000);
    }, 1);
  }

  function dismiss(alert) {
    $('.alert-' + alert.index).collapse('hide');
    $timeout(function() { AlertService.remove(alert.index); }, 1000);
  }
}

})();
