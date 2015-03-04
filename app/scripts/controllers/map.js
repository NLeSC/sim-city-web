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

MapController.$inject = ['$http'];
function MapController($http) {
  var vm = this;
  vm.addLayer = addLayer;
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
        projection: 'EPSG:900913',
      },
    };
  vm.layerNames = [];
  vm.layers = [
      { name: 'bingsat',
        source: {
            name: 'Bing Maps',
            type: 'BingMaps',
            key: 'AsP2TER1bj7tMZGuQtDkvWtX9vOezdG3zbeJp3tOv8d1Q4XrDLd6bEMz_nFsmcKi',
            imagerySet: 'Aerial'
          },
      }, {
        name: 'blr_roads',
        source: {
          type: 'TileWMS',
          url: '/geoserver/Bangalore/wms',
          params: {
            'LAYERS': 'blr_roads',
            'TILED': true,
          },
        },
      },
    ];
  vm.osm = {
      source: {
        type: 'OSM',
      },
    };
  vm.possibleLayers = [
    { name: 'bingroad',
      source: {
          name: 'Bing Maps',
          type: 'BingMaps',
          key: 'AsP2TER1bj7tMZGuQtDkvWtX9vOezdG3zbeJp3tOv8d1Q4XrDLd6bEMz_nFsmcKi',
          imagerySet: 'Road',
        },
    },
  ];
  vm.removeLayer = removeLayer;

  updateLayerNames();

  function updateLayerNames() {
    var parser = new ol.format.WMSCapabilities();
    $http.get('/geoserver/Bangalore/wms?request=getCapabilities')
      .success(function(data) {
        var result = parser.read(data);
        var existingNames = [];
        for (var i = 0; i < vm.layers.length; i++){
          existingNames.push(vm.layers[i].name);
        }
        // Copy original array
        var possibleLayers = vm.possibleLayers.slice();
        var layers = result.Capability.Layer.Layer;
        for (i = 0; i < layers.length; i++) {
          if (existingNames.indexOf(layers[i].Name) === -1 && layers[i].queryable === true) {
            possibleLayers.push({
              name: layers[i].Name,
              source: {
                type: 'TileWMS',
                url: '/geoserver/Bangalore/wms',
                params: {
                  'LAYERS': layers[i].Name,
                  'TILED': true,
                },
              },
            });
          }
        }
        sort(possibleLayers);
        vm.possibleLayers = possibleLayers;
      });
  }

  function removeLayer() {
    var layer = vm.currentRmLayer;
    delete vm.currentRmLayer;
    insertSorted(vm.possibleLayers, layer);
    vm.layers.splice(vm.layers.indexOf(layer), 1);
  }
  function addLayer() {
    var layer = vm.currentAddLayer;
    delete vm.currentAddLayer;
    vm.layers.push(layer); // add as top layer
    vm.possibleLayers.splice(vm.possibleLayers.indexOf(layer), 1);
  }
}

function insertSorted(array, elem) {
  // Uses insert sort
  array.push(elem);
  sort(array);
}

function sort(array) {
  for (var i = 1; i < array.length; i++) {
    var x = array[i];
    var j = i;
    while (j > 0 && array[j-1].name > x.name) {
      array[j] = array[j-1];
      j = j - 1;
    }
    array[j] = x;
  }
}

//
//   var map;
//   var tiled;
//   // // pink tile avoidance
//   // OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
//   // // make OL compute scale according to WMS spec
//   // OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
//
//   function init() {
//     var format = 'image/png';
//
//     var bounds = new OpenLayers.Bounds(
//       77.4706039428711, 12.78612995147705,
//       77.7698974609375, 13.1386137008667
//     );
//     var options = {
//       controls: [],
//       maxExtent: bounds,
//       maxResolution: 0.0013768896460533,
//       projection: 'EPSG:3857',
//       units: 'm'
//     };
//     map = new OpenLayers.Map('map', options);
//
//     // setup tiled layer
//     tiled = new OpenLayers.Layer.WMS(
//       'Geoserver layers - Tiled', 'http://wabisuke.fieldsofview.in:8081/geoserver/UVA/wms',
//       {
//         'LAYERS': 'Bangalore',
//         'STYLES': '',
//         'format': format
//       },
//       {
//         buffer: 0,
//         displayOutsideMaxExtent: true,
//         isBaseLayer: true,
//         yx : {'EPSG:3857' : false}
//       }
//     );
//
//     map.addLayers([tiled]);
//
//     // build up all controls
//     // map.addControl(new OpenLayers.Control.PanZoomBar({
//     //     position: new OpenLayers.Pixel(2, 15)
//     // }));
//     // map.addControl(new OpenLayers.Control.Navigation());
//     // map.addControl(new OpenLayers.Control.Scale($('scale')));
//     // map.addControl(new OpenLayers.Control.MousePosition({element: $('location')}));
//     map.zoomToExtent(bounds);
//   }

})();
