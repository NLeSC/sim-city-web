'use strict';

angular.module('simCityWebApp')
  .controller('OverviewCtrl', ['$scope', '$http', '$interval', 'MessageBus', function ($scope, $http, $interval, MessageBus) {
    angular.extend($scope, {
      jobs: [{name: 'Loading...', value: ''}],
      tasks: [{name: 'Loading...', value: ''}]
    });
    /**
      * Loads and populates the notifications
      */
    this.loadOverview = function (){
      $http.get('/explore/overview').
      success(function(data) {
        angular.extend($scope, {
          tasks: [
            {name: 'queued', value: data.todo},
            {name: 'processing', value: data.locked},
            {name: 'done', value: data.done},
            {name: 'with error', value: data.error}
          ],
          jobs: [
            {name: 'active',    value: data.active_jobs},
            {name: 'pending',   value: data.pending_jobs},
            {name: 'finished',  value: data.finished_jobs}
          ]
        });
      }).
      error(function(data, status) {
        if (status === 0) {
          status = '';
        } else {
          status = '(' + status + ')';
        }
        angular.extend($scope, {
          jobs: [{name: 'Error loading', value: status}],
          tasks: [{name: 'Error loading', value: status}]
        });
      });
    };
    //Put in interval, first trigger after 10 seconds
    $interval(function(){
       this.loadOverview();
    }.bind(this), 10000);

    MessageBus.subscribe('task.submitted', this.loadOverview);
    MessageBus.subscribe('job.submitted', this.loadOverview);

    //invoke initialy
    this.loadOverview();
}]);
