(function(){

'use strict';

angular.module('simCityWebApp')
.controller('ParameterListCtrl', ParameterListController);


ParameterListController.$inject = ['$http', 'MessageBus', 'SimCityWebService'];

function ParameterListController($http, MessageBus, SimCityWebService) {
  var vm = this;
  MessageBus.subscribe('task.failed', function(event, msg) {
    vm.errorMsg = msg.formatted;
    vm.submitstatus = 'error';
  });

  vm.log = function() { console.log(vm.input); };
  vm.startSimulation = startSimulation;
  vm.input = {};

  function startSimulation() {
      vm.submitstatus = 'loading';
      delete vm.errorMsg;
      
      SimCityWebService.submitTask('matsim', vm.input).
        success(function() {
          vm.submitstatus = 'success';
        });
  }

  $http.get('/explore/simulate/matsim/latest').
  success(function(data) {
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
