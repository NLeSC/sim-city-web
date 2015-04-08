(function(){
  'use strict';

angular.module('simCityWebApp')
  .controller('TaskListCtrl', TaskListController);
  // .controller('RemoveTaskModalInstanceCtrl', RemoveTaskModalInstanceController);

TaskListController.$inject = ['MessageBus', 'LayerService', 'SimCityWebService', '$interval', 'AlertService'];
function TaskListController(MessageBus, LayerService, WebService, $interval, AlertService) {
  var vm = this;

  vm.modalRemove = modalRemove;
  vm.remove = remove;
  vm.status = 'Loading...';
  vm.tasks = [];
  vm.updateView = updateView;
  vm.viewTask = viewTask;
  vm.visualizeFire = visualizeFire;
  vm.visualizeTraffic = visualizeTraffic;

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

  function visualizeTraffic(task) {
    var layerId = LayerService.addVectorLayer({
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
    LayerService.activateLayer(layerId);
  }

  var styleByResponseTime = {
    0: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#35ff20',
            opacity: 0.5,
            width: 3,
          })
        })],
    100: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#29ffba',
            opacity: 0.5,
            width: 3,
          })
        })],
    150: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#0000ff',
            opacity: 0.5,
            width: 4,
          })
        })],
  };
  var sortedStyleByResponseKeys = Object.keys(styleByResponseTime).sort(function(a,b){return b-a;});
  function visualizeFire(task) {
    var layerId = LayerService.addVectorLayer({
      name: task.id + '_fire_path',
      title: '\'' + task.input.name + '\' fire engine paths',
      source: {
        type: 'GeoJSON',
        url: task.url + '/GeoFirePaths.json',
      },
      style: function(feature) {
        var response = feature.getProperties().responsetime;
        for (var i = 0; i < sortedStyleByResponseKeys.length; i++) {
          if (response >= sortedStyleByResponseKeys[i]) {
            return styleByResponseTime[sortedStyleByResponseKeys[i]];
          }
        }
      },
    });
    LayerService.activateLayer(layerId);
    var fireLayer = LayerService.getVectorLayer('blr_fires');
    if (fireLayer) {
      fireLayer.style = {
        icon: {
          src: 'images/fire.png'
        },
      };
      LayerService.activateLayer(fireLayer.id);
    }
    var firestationLayer = LayerService.getVectorLayer('blr_firestations');
    if (firestationLayer) {
      firestationLayer.style = {
        icon: {
          src: 'images/firestation.png'
        },
      };
      LayerService.activateLayer(firestationLayer.id);
    }
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
            AlertService.add('success', 'Removed simulation.');
          }, function() {
            $('#removeSimulationModal').modal('hide');
            AlertService.add('success', 'Removed simulation (but failed to reload simulation overview).');
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
