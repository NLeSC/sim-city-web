(function(){
  'use strict';

angular.module('simCityWebApp')
  .controller('TaskListCtrl', TaskListController);
  // .controller('RemoveTaskModalInstanceCtrl', RemoveTaskModalInstanceController);

TaskListController.$inject = ['MessageBus', 'LayerService', 'SimCityWebService', '$interval'];
function TaskListController(MessageBus, LayerService, WebService, $interval) {
  var vm = this;

  vm.modalRemove = modalRemove;
  vm.remove = remove;
  vm.status = 'Loading...';
  vm.tasks = [];
  vm.updateView = updateView;
  vm.viewTask = viewTask;
  vm.visualize = visualize;

  updateView();
  MessageBus.subscribe('task.submitted', updateView);
  $interval(updateView, 10000);

  var styleByVolume = {
    0: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 3,
          })
        })],
    12: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'orange',
            width: 3,
          })
        })],
    25: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 4,
          })
        })],
  };
  // reverse sort
  var sortedStyleByVolumeKeys = Object.keys(styleByVolume).sort(function(a,b){return b-a;});

  function visualize(task) {
    var layer = LayerService.addVectorLayer({
      name: task.id + '_volume',
      title: '\'' + task.input.name + '\' link volume',
      source: {
        type: 'GeoJSON',
        url: task.url + '/GeoLinkVolume.8.json',
      },
      style: function(feature) {
        var volume = feature.getProperties().volume;
        for (var i = 0; i < sortedStyleByVolumeKeys.length; i++) {
          if (volume >= sortedStyleByVolumeKeys[i]) {
            return styleByVolume[sortedStyleByVolumeKeys[i]];
          }
        }
      },
    });
    LayerService.activateLayer(layer);
  }

  function viewTask(task) {
    MessageBus.publish('task.selected', task);
  }

  function updateView() {
    return WebService.viewTasks('matsim', '0.3')
      .success(function(data) {
        vm.tasks = data.rows.map(function(el) { return el.value; });
        if (vm.status) {
          delete vm.status;
        }
      })
      .error(function(data, status) {
        if (vm.status) {
          if (status === 0) {
            status = '';
          } else {
            status = '(code ' + status + ')';
          }
          vm.status = 'Cannot load infrastructure overview ' + status;
        }
      });
  }

  function modalRemove(task) {
    $('#removeSimulationModal').appendTo('body');
    vm.toRemove = task;
    delete vm.removeError;
  }

  function remove() {
    WebService.deleteTask(vm.toRemove.id, vm.toRemove.rev)
      .success(function() {
        updateView()
          .then(function() {
            $('#removeSimulationModal').modal('hide');
          }, function() {
            $('#removeSimulationModal').modal('hide');
          });
      })
      .error(function (data, status) {
        if (status === 409) {
          vm.removeError = 'cannot remove simulation: it was modified';
        } else if (data) {
          vm.removeError = 'cannot remove simulation: ' + data;
        } else {
          vm.removeError = 'cannot remove simulation';
        }
      });
  }
}

})();
