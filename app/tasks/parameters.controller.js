(function(){

'use strict';

angular.module('simCityWebApp')
.controller('ParameterListCtrl', ParameterListController);


ParameterListController.$inject = ['$http', 'MessageBus', 'SimCityWebService', 'AlertService'];

function ParameterListController($http, MessageBus, SimCityWebService, AlertService) {
  var vm = this;
  var version = '0.3';
  var simulation = 'matsim';

  MessageBus.subscribe('task.failed', function(event, msg) {
    vm.errorMsg = msg.formatted;
    vm.submitstatus = 'error';
  });

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
        .error(function(data, status) {
          var message = 'Cannot add \'' + vm.input.name + '\'';
          if (status === 400 && data && data.error) {
            message += ': ' + data.error;
          } else if (status === 500){
            message += ': internal server error';
          } else if (status === 502){
            message += ': cannot reach database';
          }
          AlertService.add('error', message);
        });
  }

  $http.get('/explore/simulate/' + simulation + '/' + version).
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
