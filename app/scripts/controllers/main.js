'use strict';
/**
 * @ngdoc function
 * @name simCityWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simCityWebApp
 */
angular.module('simCityWebApp')
  .controller('MainCtrl', ['$scope', 'SimCityWebService', 'MessageBus', function ($scope, SimCityWebService, MessageBus) {
    MessageBus.subscribe('job.maxed', function() {
      $scope.statusMsg = 'Already enough jobs running';
    });
    MessageBus.subscribe('job.failed', function(event, msg) {
      $scope.errorMsg = msg.formatted;
    });

    angular.extend($scope, {
      startJob: function() {
        $scope.showLoader = true;
        $scope.showSuccess = false;
        delete $scope.statusMsg;
        delete $scope.errorMsg;

        SimCityWebService.submitJob().
          success(function(data) {
            $scope.statusMsg = 'Started job ' + data.batch_id;
            $scope.showSuccess = true;
          }).
          finally(function() {
            $scope.showLoader = false;
          });
      },
    });
  }]);
// angular.extend($scope, {
//   olmap: new ol.Map({
//     view: new ol.View({
//       center: [12.97194, 77.59369],
//       zoom: 11,
//       projection: new ol.proj.Projection({
//         code: 'EPSG:4326',
//         units: 'degrees'
//       })
//     }),
//     layers: [
//       // new ol.layer.Tile({
//       //   source: new ol.source.TileWMS({
//       //     url: 'https://simcity.amsterdam-complexity.nl/geoserver/wms',
//       //     params: {'LAYERS': 'Bangalore:blr_road'},
//       //     servertype: 'geoserver'
//       //   })
//       // }),
//       new ol.layer.Tile({
//         source: new ol.source.MapQuest({layer: 'osm'})
//       }),
//     ],
//     target: $('map')
//   })
// });

//
// angular.extend($scope, {
//   olmap:
// });
//
// angular.extend($scope, {
//   defaults: {
//     layers: {
//       main: {
//         source: {
//           type: 'OSM',
//           url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
//         }
//       },
//       'Bangalore:blr_road': {
//         source: {
//           type: 'WMS',
//           url: 'https://simcity.amsterdam-complexity.nl/geoserver/Bangalore/wms'
//         }
//       }
//     },
//     maxZoom: 14,
//   },
//   center: {
//     lat:  12.97194,
//     lon:  77.59369,
//     zoom: 11
//   }
// });

  //
  // function parameterForm(parent, spec) {
  //     var f = document.createElement('form');
  //     f.setAttribute('method', 'post');
  //     f.setAttribute('action', '/explore/simulate/');
  //
  //     var p = document.createElement('input');
  // }
  //
  // function showOverview() {
  //   var value = ajax get '/explore/overview';
  //   $('overview').append('tr');
  // }
