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

MapController.$inject = ['$scope', 'LayerService', 'olData', 'MessageBus'];

function MapController($scope, LayerService, olData, MessageBus) {
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
        layers: [ 'click' ],
        map: [ 'singleclick' ],
      },
    };
  vm.layerService = LayerService;
  vm.overlayDeregister = null;
  vm.showLayers = [];
  vm.clickListeners = {};

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

  listenForClicks();
  MessageBus.subscribe('layer.overlay.activate', showOverlay);
  MessageBus.subscribe('layer.overlay.deactivate', hideOverlay);
  MessageBus.subscribe('map.click.listen', addClickListener);
  MessageBus.subscribe('map.click.stop', removeClickListener);
  MessageBus.subscribe('map.update', updateMap);

  function hideOverlay() {
    if (vm.overlayDeregister !== null) {
      vm.overlayDeregister();
      vm.overlayDeregister = null;
    }
  }

  function showOverlay(event, overlaySpec) {
    console.log(overlaySpec);
    olData.getMap().then(function(map) {
      var overlayHidden = true;
      var overlay = new ol.Overlay({
          element: document.getElementById('map-overlay-info'),
          positioning: 'center-center',
          offset: [-25, 59],
          position: [0, 0]
      });

      hideOverlay();

      // Mouse over function, called from the Map Events
      var layerName = LayerService.getLayer(overlaySpec.name).name;
      var eventId ='openlayers.layers.' + layerName + '.click';
      console.log(eventId);
      vm.overlayDeregister = $scope.$on(eventId,
        function(event, feature, olEvent) {
          $scope.$apply(function() {
            vm.overlayProperties = [];
            if (feature) {
              var p = feature.getProperties();
              for (var key in p) {
                if (key !== 'geometry' && p.hasOwnProperty(key)) {
                  vm.overlayProperties.push({
                    name: key,
                    value: p[key],
                  });
                }
              }
            }
            // vm.overlayProperties = overlaySpec.callback(feature);
          });

          // console.log(olEvent);
          if (!feature) {
              map.removeOverlay(overlay);
              overlayHidden = true;
              return;
          } else if (overlayHidden) {
              map.addOverlay(overlay);
              overlayHidden = false;
          }

          overlay.setPosition(map.getEventCoordinate(olEvent));
        });
      });
  }

  function listenForClicks() {
    $scope.$on('openlayers.map.singleclick', function(event, data) {
      $scope.$apply(function() {
        for (var listener in vm.clickListeners) {
          if (vm.clickListeners.hasOwnProperty(listener)) {
            vm.clickListeners[listener](event, data);
          }
        }
      });
    });
  }

  function addClickListener(event, data) {
    vm.clickListeners[data.id] = data.callback;
  }
  function removeClickListener(event, id) {
    delete vm.clickListeners[id];
  }

  function updateMap(event, callback) {
    callback();
  }
}

})();
