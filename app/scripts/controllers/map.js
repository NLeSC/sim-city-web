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

MapController.$inject = ['$timeout', '$http', 'LayerService'];
function MapController($timeout, $http, LayerService) {
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
        attribution: false,
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
  LayerService.addLayer(blr_roads);
  LayerService.activateLayer(blr_roads);
  LayerService.addTileWMSLayers('/geoserver/Bangalore/wms');

  var styleByVolume = {
    0: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 1,
          })
        })],
    12: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'orange',
            width: 1,
          })
        })],
    25: [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 2,
          })
        })],
  };
  // reverse sort
  var sortedStyleByVolumeKeys = Object.keys(styleByVolume).sort(function(a,b){return b-a;});

  LayerService.addLayer({
        name: 'volume',
        title: 'Link volume 8 AM',
        source: {
          type: 'GeoJSON',
          url: '/output/blr/GeoLinkVolume.8.json',
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
}

})();
