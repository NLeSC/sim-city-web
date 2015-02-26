(function(){

'use strict';

function MainController($scope, SimCityWebService, MessageBus) {
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
}

/**
 * @ngdoc function
 * @name simCityWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simCityWebApp
 */
angular.module('simCityWebApp')
  .controller('MainCtrl', ['$scope', 'SimCityWebService', 'MessageBus', MainController]);
})();
