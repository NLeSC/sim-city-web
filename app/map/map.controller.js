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

MapController.$inject = ['LayerService'];

function MapController(LayerService) {
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
    };
  vm.layerService = LayerService;
  vm.showLayers = [];

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
  LayerService.addImageLayer(blr_roads);
  LayerService.addLayersFromOWS('/geoserver/Bangalore/ows');
}

})();
