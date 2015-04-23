(function() {
'use strict';

angular.module('simCityWebApp')
  .controller('ViewTaskCtrl', ViewTaskController);

ViewTaskController.$inject = ['MessageBus', 'SimCityWebService', 'LayerService'];
function ViewTaskController(MessageBus, WebService, LayerService) {
  var vm = this;

  vm.activate = activate;
  vm.deactivate = deactivate;
  vm.status = 'Loading...';
  vm.task = {};
  vm.urlBase = '/couchdb/simcity/';
  vm.visualize = visualize;

  MessageBus.subscribe('task.selected', vm.activate);

  function activate(event, task) {
    $('#viewTaskModal').modal('show');
    WebService.getTask(task.id)
      .success(function(task) {
        vm.task = task;
        vm.task.id = vm.task._id;
        vm.task.rev = vm.task._rev;
        if (vm.task.done > 0) {
          vm.task.doneDate = new Date(vm.task.done*1000).toString();
        } else {
          vm.task.doneDate = 'not done';
        }
        if (vm.task.lock > 0) {
          vm.task.lockDate = new Date(vm.task.lock*1000).toString();
        } else {
          vm.task.lockDate = 'not processing';
        }
        delete vm.status;
      })
      .error(function() {
        vm.status = 'Cannot load task information.';
      });
  }

  function visualize(file) {
    var layerId = LayerService.addVectorLayer({
      name: vm.task.id + '_' + file,
      title: '\'' + vm.task.input.name + '\': ' + file,
      source: {
        type: 'GeoJSON',
        url: vm.urlBase + vm.task.id + '/' + file,
      },
      style: {
        stroke: {
          color: '#00FF00',
          width: 2,
        },
      },
    });
    LayerService.activateLayer(layerId);
  }

  function deactivate() {
    $('#viewTaskModal').modal('hide');
    vm.task = null;
    vm.status = 'Loading...';
  }
}

})();
