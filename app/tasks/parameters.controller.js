(function(){

'use strict';

angular.module('simCityWebApp')
.controller('ParameterListCtrl', ParameterListController);


ParameterListController.$inject = ['SimCityWebService', 'AlertService'];

function ParameterListController(SimCityWebService, AlertService) {
  var vm = this;
  var version = '0.3';
  var simulation = 'matsim';
  vm.startSimulation = startSimulation;
  vm.input = {};

  function startSimulation() {
      vm.submitstatus = 'loading';
      delete vm.errorMsg;
      if (vm.input.name) {
        vm.input._id = 'task_' + vm.input.name + '_' + simulation + '_' + version;
      }
      SimCityWebService.submitTask('matsim', vm.input)
        .success(function() {
          vm.submitstatus = 'success';
          AlertService.add('success', 'Added simulation \'' + vm.input.name + '\'');
        })
        .error(function(message, detailedMessage) {
          vm.errorMsg = detailedMessage.formatted;
          vm.submitstatus = 'error';
          AlertService.add('error', message);
        });
  }

  SimCityWebService.getSimulation(simulation, version)
    .success(function(data) {
      for (var i = 0; i < data.parameters.length; i++) {
        var key = data.parameters[i].name;
        if (data.parameters[i].default) {
          if (data.parameters[i].dtype === 'int') {
            vm.input[key] = parseInt(data.parameters[i].default, 10);
          } else if (data.parameters[i].dtype === 'float') {
            vm.input[key] = parseFloat(data.parameters[i].default);
          } else {
            vm.input[key] = data.parameters[i].default;
          }
        }
      }
      vm.parameters = data.parameters;
    });
}

})();
