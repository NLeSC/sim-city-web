(function() {

'use strict';


angular.module('simCityWebApp')
  .controller('ViewTaskCtrl', ViewTaskController)
  .filter('bytes', function() {
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];

    return function(bytes, precision) {
    	if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '-';
      }
      var number = Math.max(1, Math.floor(Math.log(bytes) / Math.log(1000)));
      if (typeof precision === 'undefined') {
        precision = 1;
      }
    	return (bytes / Math.pow(1000, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
  });

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
