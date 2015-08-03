(function(){

'use strict';

angular.module('simCityWebApp')
.controller('ParameterListCtrl', ParameterListController);


ParameterListController.$inject = ['SimCityWebService', 'AlertService', 'LayerService'];

function ParameterListController(SimCityWebService, AlertService, LayerService) {
  var vm = this;
  var version = '0.3';
  var simulation = 'matsim';
  vm.activatePoint2DLayer = activatePoint2DLayer;
  vm.input = {};
  vm.copyLayerPoints = {};
  vm.copyPoint2DLayer = copyPoint2DLayer;
  vm.layerPoints = {};
  vm.resetPoint2DLayer = resetPoint2DLayer;
  vm.startSimulation = startSimulation;

  function startSimulation() {
      vm.submitstatus = 'loading';
      delete vm.errorMsg;
      if (vm.input.name) {
        vm.input._id = 'task_' + vm.input.name + '_' + simulation + '_' + version;
      }
      if (!collectPoints()) {
        return;
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

  function activatePoint2DLayer(paramName) {
    if (!vm.layerPoints.hasOwnProperty(paramName)) {
      vm.layerPoints[paramName] = {};
      vm.layerPoints[paramName].layer = LayerService.createLayer(vm.parameters[paramName],
        vm.parameters[paramName].icon ?
          { icon: { src: vm.parameters[paramName].icon }} :
          null);
    }
    LayerService.editPointLayer(vm.layerPoints[paramName].layer);
  }

  function resetPoint2DLayer(paramName) {
    if (vm.layerPoints.hasOwnProperty(paramName)) {
      LayerService.removeLayer(vm.layerPoints[paramName].layer);
      vm.layerPoints.remove(paramName);
    }
  }

  function copyPoint2DLayer(paramName) {
    if (!vm.copyLayerPoints[paramName]) {
      AlertService.add('error', 'no layer to copy from selected');
    }
    vm.activatePoint2DLayer(paramName);
    var features = LayerService.getFeatures(vm.copyLayerPoints[paramName]);
    LayerService.addFeatures(vm.layerPoints[paramName].layer, features);
  }

  function collectPoints() {
    for (var i = 0; i < vm.parameters.length; i++) {
      var key = vm.parameters[i].name;
      if (vm.parameters[i].type === 'list' && vm.parameters[i].contents.type === 'point2d') {
        vm.input[key] = [];
        if (vm.layerPoints.hasOwnProperty(key)) {
          var features = LayerService.getFeatures(vm.layerPoints[key].layer);
          var ret = features.forEachFeature(function(feature) {
            var geom = feature.getGeometry();
            if (!(geom instanceof ol.geom.Point)) {
              return false;
            }
            vm.input[key].push({
              x: geom.getCoordinates()[0],
              y: geom.getCoordinates()[1],
              properties: feature.getProperties()
            });
          });
          if (ret === false) {
            AlertService.add('error', 'feature list of ' + (vm.parameters[key].title || vm.parameters[key].name) + ' contains non-point features.');
          }
        } else {
          if (vm.parameters[i].min_length) {  // exists and not 0
            AlertService.add('error', 'no points selected for ' + (vm.parameters[i].title || vm.parameters[i].name) + ', select at least ' + vm.parameters[i].min_length);
            return false;
          } else {
            AlertService.add('warning', 'no points selected for ' + (vm.parameters[i].title || vm.parameters[i].name));
          }
        }
        if (vm.parameters[i].min_length && vm.input[key].length < vm.parameters[i].min_length) {
          AlertService.add('error', 'please select at least ' + vm.parameters[i].min_length + ' points for ' + (vm.parameters[i].title || vm.parameters[i].name) + ' (now ' + vm.input[key].length + ')');
          return false;
        }
        if (vm.parameters[i].max_length && vm.input[key].length > vm.parameters[i].max_length) {
          AlertService.add('error', 'please select at most ' + vm.parameters[i].max_length + ' points for ' + (vm.parameters[i].title || vm.parameters[i].name) + ' (now ' + vm.input[key].length + ')');
          return false;
        }
      }
    }
    return true;
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
