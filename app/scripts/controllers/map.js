'use strict';

/**
 * @ngdoc function
 * @name simCityWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simCityWebApp
 */
angular.module('simCityWebApp')
  .controller('MapCtrl', ['$scope', function ($scope) {
    angular.extend($scope, {
      bangalore: {
        lat: 12.97194,
        lon: 77.59369,
        zoom: 11,
      },
      defaults: {
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
      },
      osm: {
        source: {
          type: 'OSM',
        },
      },
      roads: {
        source: {
          type: 'TileWMS',
          url: '/geoserver/wms',
          params: {
            'LAYERS': 'Bangalore:blr_roads',
            'TILED': true,
          },
        },
      },
      bingroad: {
        source: {
            name: 'Bing Maps',
            type: 'BingMaps',
            key: 'AsP2TER1bj7tMZGuQtDkvWtX9vOezdG3zbeJp3tOv8d1Q4XrDLd6bEMz_nFsmcKi',
            imagerySet: 'Road',
          },
      },
      bingsat: {
        source: {
            name: 'Bing Maps',
            type: 'BingMaps',
            key: 'AsP2TER1bj7tMZGuQtDkvWtX9vOezdG3zbeJp3tOv8d1Q4XrDLd6bEMz_nFsmcKi',
            imagerySet: 'Aerial'
          },
      },
    });
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
}]);
