(function(){
  'use strict';

angular.module('simCityWebApp')
  .controller('TaskListCtrl', ['$scope', 'MessageBus', function ($scope, MessageBus) {
    angular.extend($scope, {
      tasksAdded: [],
    });

    MessageBus.subscribe('task.submitted', function(task) {
      $scope.tasksAdded.push(task);
    });
}]);

})();
