(function(){

'use strict';

angular.module('simCityWebApp')
.controller('ParameterListCtrl', ParameterListController);


ParameterListController.$inject = ['SimCityWebService', 'AlertService', 'LayerService', '$scope', 'olHelpers', 'MessageBus'];

function ParameterListController(SimCityWebService, AlertService, LayerService, $scope, olHelpers, MessageBus) {
  var vm = this;
  var version = '0.4';
  var simulation = 'matsim';
  vm.activatePoint2DLayer = activatePoint2DLayer;
  vm.copyLayerPoints = {};
  vm.copyPoint2DLayer = copyPoint2DLayer;
  vm.deactivatePoint2DLayer = deactivatePoint2DLayer;
  vm.editing = null;
  vm.input = {};
  vm.layerPoints = {};
  vm.layerService = LayerService;
  vm.resetPoint2DLayer = resetPoint2DLayer;
  vm.startSimulation = startSimulation;
  vm.pointsSelected = pointsSelected;

  function startSimulation() {
      vm.submitstatus = 'loading';
      delete vm.errorMsg;
      if (vm.input.name) {
        vm.input._id = 'task_' + vm.input.name + '_' + simulation + '_' + version;
      }
      if (!collectPoints()) {
        return;
      }
      SimCityWebService.submitTask('matsim/0.4', vm.input)
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

  function activatePoint2DLayer(paramName, index) {
    if (!vm.layerPoints.hasOwnProperty(paramName)) {
      vm.layerPoints[paramName] = {};
      vm.layerPoints[paramName].layer = LayerService.createLayer(vm.parameters[index],
        vm.parameters[index].icon ?
          { icon: { src: vm.parameters[index].icon }} :
          null);
    }
    LayerService.activateLayer(vm.layerPoints[paramName].layer);
    deactivatePoint2DLayer();
    MessageBus.publish('map.click.listen', {
      id: paramName,
      callback: function(event, data) {
        var p = ol.proj.transform([data.lon, data.lat], 'EPSG:3857', 'EPSG:4326');
        console.log(p);
        MessageBus.publish('map.update', function() {
        LayerService.addFeatures(vm.layerPoints[paramName].layer, [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [p[0], p[1]],
            },
          }
        ], vm.parameters[index].icon ?
          { icon: { src: vm.parameters[index].icon }} :
          null);
        console.log(LayerService.getLayer(vm.layerPoints[paramName].layer));
        });
      }});
    vm.editing = paramName;
  }
  function deactivatePoint2DLayer() {
    if (vm.editing !== null) {
      MessageBus.publish('map.click.stop', vm.editing);
      vm.editing = null;
    }
  }

  function resetPoint2DLayer(paramName) {
    if (vm.layerPoints.hasOwnProperty(paramName)) {
      MessageBus.publish('map.update', function() {
        LayerService.unsetFeatures(vm.layerPoints[paramName].layer);
        LayerService.removeLayer(vm.layerPoints[paramName].layer);
        delete vm.layerPoints[paramName];
        deactivatePoint2DLayer();
      });
    }
  }

  function pointsSelected(paramName) {
    if (!vm.layerPoints.hasOwnProperty(paramName)) {
      return 0;
    } else {
      var layer = LayerService.getLayer(vm.layerPoints[paramName].layer);
      return layer.source.geojson.object.features.length;
    }
  }

  function copyPoint2DLayer(paramName, index) {
    if (!vm.copyLayerPoints[paramName]) {
      AlertService.add('error', 'no layer to copy from selected');
    }
    vm.activatePoint2DLayer(paramName, index);
    var layer = olHelpers.createLayer(vm.copyLayerPoints[paramName], 'EPSG:4326', 'tempLayer');
    delete vm.copyLayerPoints[paramName];

    layer.getSource().on('change', function(evt){
      var source = evt.target;
      if (source.getState() === 'ready') {
        $scope.$apply(function () {
          var features = layer.getSource().getFeatures();
          features = features.map(function(el) {
            var elProps = el.getProperties() || {};
            var props = {};
            for (var prop in elProps) {
              if (prop !== 'geometry' && prop !== '__proto__') {
                props[prop] = elProps[prop];
              }
            }
            var coords = el.getGeometry().getCoordinates();
            return {
              type: 'Feature',
              id: el.getId(),
              geometry: {
                type: 'Point',
                coordinates: [coords[0], coords[1]],
              },
              properties: props,
            };
          });
          LayerService.addFeatures(vm.layerPoints[paramName].layer, features);
        });
      }
    });
  }

  function collectPoints() {
    for (var i = 0; i < vm.parameters.length; i++) {
      collectPointsOfParam(vm.parameters[i]);
    }
    return true;
  }

  function collectPointsOfParam(param) {
    var key = param.name;
    if (param.type === 'list' && param.contents.type === 'point2d') {
      vm.input[key] = [];
      if (vm.layerPoints.hasOwnProperty(key)) {
        var features = LayerService.getFeatures(vm.layerPoints[key].layer);
        features.map(function(feature) {
          console.log(param);
          var paramProps = param.contents.properties || [];
          var elProps = features.properties || {};
          var props = {};
          paramProps.map(function(prop){
            console.log(prop);
            props[prop.name] = (elProps.hasOwnProperty(prop.name) ?
                               elProps[prop.name] :
                               ((prop.type === 'str' || prop.type === 'string') ? ' ' : 0));
          });

          vm.input[key].push({
            x: feature.geometry.coordinates[0],
            y: feature.geometry.coordinates[1],
            properties: props,
          });
        });
      } else {
        if (param.min_length) {  // exists and not 0
          AlertService.add('error', 'no points selected for ' + (param.title || param.name) + ', select at least ' + param.min_length);
          return false;
        } else {
          AlertService.add('warning', 'no points selected for ' + (param.title || param.name));
        }
      }
      if (param.min_length && vm.input[key].length < param.min_length) {
        AlertService.add('error', 'please select at least ' + param.min_length + ' points for ' + (param.title || param.name) + ' (now ' + param.length + ')');
        return false;
      }
      if (param.max_length && vm.input[key].length > param.max_length) {
        AlertService.add('error', 'please select at most ' + param.max_length + ' points for ' + (param.title || param.name) + ' (now ' + vm.input[key].length + ')');
        return false;
      }
    }
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
