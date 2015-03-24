(function() {

'use strict';

/**
 * @ngdoc function
 * @name simCityWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simCityWebApp
 */
angular.module('simCityWebApp').controller('MapCtrl', MapController);

MapController.$inject = ['$scope', '$timeout', '$http', 'LayerService'];

function MapController($scope, $timeout, $http, LayerService) {
  var vm = this;

  vm.bangalore = {
      lat: 12.97194,
      lon: 77.59369,
      zoom: 11,
    };
  vm.defaults = {
      interactions: {
        mouseWheelZoom: true,
      },
      controls: {
        zoom: true,
        attribution: true,
      },
      view: {
        maxZoom: 18,
        minZoom: 4,
        projection: 'EPSG:3857',
      },
      events: {
        layers: ['mousemove'],
      },
    };
  vm.layerService = LayerService;
  vm.showLayers = [];
  
  $scope.$on('openlayers.layers.task_full_matsim_0.3_volume.mousemove', function(event, feature) {
    if (!feature) {
      return;
    }
    $scope.$apply(function() {
      vm.volume = feature.getProperties().volume;
    });
  });



  var blr_roads = {
    name: 'blr_roads',
    title: 'Bangalore road network',
    source: {
      type: 'TileWMS',
      url: '/geoserver/Bangalore/wms',
      params: {
        'LAYERS': 'blr_roads',
        'TILED': true,
      },
    },
  };
  LayerService.addLayer(blr_roads);
  LayerService.addTileWMSLayers('/geoserver/Bangalore/wms');
}

})();
