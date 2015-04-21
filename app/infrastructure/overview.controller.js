(function () {

'use strict';

angular.module('simCityWebApp')
  .controller('OverviewCtrl', OverviewController);

OverviewController.$inject = ['$interval', 'MessageBus', 'SimCityWebService'];
function OverviewController($interval, MessageBus, WebService) {
  var vm = this;

  vm.jobs = [];
  vm.loadOverview = loadOverview;
  vm.status = 'Loading...';
  vm.tasks = [];

  MessageBus.subscribe('task.submitted', vm.loadOverview);
  MessageBus.subscribe('job.submitted', vm.loadOverview);

  //Put in interval, first trigger after 10 seconds
  $interval(vm.loadOverview, 10000);
  //invoke initialy
  vm.loadOverview();

  /**
    * Loads and populates the overview
    */
  function loadOverview(){
    WebService.overview()
      .then(function(data) {
        vm.jobs = data.jobs;
        vm.tasks = data.tasks;
        if (vm.status) {
          delete vm.status;
        }
      }, function(msg) {
        if (vm.status) {
          vm.status = msg;
        }
      });
  }
}

})();
