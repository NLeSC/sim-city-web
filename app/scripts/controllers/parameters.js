(function(){

'use strict';

angular.module('simCityWebApp')
.controller('ParameterListCtrl', ['$scope', '$http', 'MessageBus', 'SimCityWebService', function ($scope, $http, SimCityWebService, MessageBus) {
  angular.extend($scope, {
    startSimulation: function() {
      $scope.showLoader = true;
      $scope.showSuccess = false;
      delete $scope.statusMsg;
      delete $scope.errorMsg;

      SimCityWebService.submitTask('matsim', $scope.input).
        success(function() {
          $scope.showSuccess = true;
        }).
        finally(function () {
          $scope.showLoader = false;
        });
      MessageBus.subscribe('task.failed', function(msg) {
        $scope.errorMsg = msg.message + ' ' + msg.httpStatusMsg;
      });
    },
    input: {},
  });

  $http.get('/explore/simulate/matsim/latest').
  success(function(data) {
    var input = {};
    for (var i = 0; i < data.parameters.length; i++) {
      if (data.parameters[i].default) {
        input[data.parameters[i].name] = data.parameters[i].default;
      }
    }
    angular.extend($scope, {
      parameters: data.parameters,
      input: input
    });
  });

}]);

})();
