(function () {

'use strict';

angular.module('simCityWebApp')
  .controller('OverviewCtrl', OverviewController);

OverviewController.$inject = ['$http', '$interval', 'MessageBus'];
function OverviewController($http, $interval, MessageBus) {
  var vm = this;

  vm.jobs = [];
  vm.loadOverview = loadOverview;
  vm.tasks = [];

  vm.status = 'Loading...';

  MessageBus.subscribe('task.submitted', vm.loadOverview);
  MessageBus.subscribe('job.submitted', vm.loadOverview);

  //Put in interval, first trigger after 10 seconds
  $interval(vm.loadOverview, 10000);
  //invoke initialy
  vm.loadOverview();

  /**
    * Loads and populates the notifications
    */
  function loadOverview(){
    $http.get('/explore/view/totals')
      .success(function(data) {
        vm.tasks = [
            {name: 'queued', value: data.todo},
            {name: 'processing', value: data.locked},
            {name: 'done', value: data.done},
            {name: 'with error', value: data.error}
          ];
        vm.jobs = [
            {name: 'active',    value: data.active_jobs},
            {name: 'pending',   value: data.pending_jobs},
            {name: 'finished',  value: data.finished_jobs}
          ];
        if (vm.status) {
          delete vm.status;
        }
      })
      .error(function(data, status) {
        if (vm.status) {
          if (status === 0) {
            status = '';
          } else {
            status = '(code ' + status + ')';
          }
          vm.status = 'Cannot load infrastructure overview ' + status;
        }
      });
  }
}

// .
// directive('animateOnChange', ['$animate', function($animate) {
//   return function(scope, elem, attr) {
//       scope.$watch(attr.animateOnChange, function(newValue, oldValue) {
//         if (newValue !== oldValue) {
//           $animate.addClass(elem, 'change', function() {
//             $animate.removeClass(elem, 'change');
//           });
//         }
//       });
//     };
// }]);

})();
