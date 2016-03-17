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
      if (vm.input.simulation) {
        vm.input._id = 'task_' + vm.input.simulation + '_' + simulation + '_' + version;
      }
      if (!collectPoints()) {
        return;
      }
      SimCityWebService.submitTask('matsim/0.4', vm.input)
        .success(function() {
          vm.submitstatus = 'success';
          AlertService.add('success', 'Added simulation \'' + vm.input.simulation + '\'');
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
    if (param.type === 'array') {
      var paramProps = [];
      for (var i = 0; i < param.items.allOf.length; i++) {
        if (param.items.allOf[i].hasOwnProperty('properties')) {
          paramProps += param.items.allOf[i].properties;
        }
      }
      vm.input[key] = [];
      if (vm.layerPoints.hasOwnProperty(key)) {
        var defaults = {};
        paramProps.map(function(prop) {
          if (prop.hasOwnProperty('default')) {
            defaults[prop.name] = prop.default;
          } else if (prop.type === 'string') {
            var len = prop.minLength || 0;
            var spaces = '   ';
            while (len > spaces.length) {
              spaces = spaces + spaces;
            }
            defaults[prop.name] = spaces.substr(0, len);
          } else if (prop.type === 'integer' || prop.type === 'number') {
            defaults[prop.name] = prop.mininum || prop.maximum || 0;
          }
        });

        var features = LayerService.getFeatures(vm.layerPoints[key].layer);

        features.map(function(feature) {
          var elProps = feature.properties || {};
          var props = {
            x: feature.geometry.coordinates[0],
            y: feature.geometry.coordinates[1]
          };
          paramProps.map(function(prop) {
            props[prop.name] = (elProps.hasOwnProperty(prop.name) ?
                               elProps[prop.name] : defaults[prop.name]);
          });

          vm.input[key].push(props);
        });
      } else {
        if (param.minItems) {  // exists and not 0
          AlertService.add('error', 'no points selected for ' + (param.title || param.name) + ', select at least ' + param.min_length);
          return false;
        } else {
          AlertService.add('warning', 'no points selected for ' + (param.title || param.name));
        }
      }
      if (param.minItems && vm.input[key].length < param.minItems) {
        AlertService.add('error', 'please select at least ' + param.minItems + ' points for ' + (param.title || param.name) + ' (now ' + param.length + ')');
        return false;
      }
      if (param.maxItems && vm.input[key].length > param.maxItems) {
        AlertService.add('error', 'please select at most ' + param.maxItems + ' points for ' + (param.title || param.name) + ' (now ' + vm.input[key].length + ')');
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
