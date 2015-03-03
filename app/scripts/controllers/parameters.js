(function(){

'use strict';

angular.module('simCityWebApp')
.controller('ParameterListCtrl', ['$scope', '$http', 'MessageBus', 'SimCityWebService', function ($scope, $http, MessageBus, SimCityWebService) {
  MessageBus.subscribe('task.failed', function(event, msg) {
    $scope.errorMsg = msg.formatted;
    $scope.submitstatus = 'error';
  });

  angular.extend($scope, {
    startSimulation: function() {
      $scope.submitstatus = 'loading';
      delete $scope.errorMsg;

      SimCityWebService.submitTask('matsim', $scope.input).
        success(function() {
          $scope.submitstatus = 'success';
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
