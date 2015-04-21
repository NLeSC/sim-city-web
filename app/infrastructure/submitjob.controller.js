(function(){

'use strict';

/**
 * @ngdoc function
 * @name simCityWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simCityWebApp
 */
angular.module('simCityWebApp')
  .controller('SubmitJobCtrl', SubmitJobController);

  SubmitJobController.$inject = ['SimCityWebService', 'MessageBus'];

function SubmitJobController(SimCityWebService, MessageBus) {
  var vm = this;
  vm.startJob = startJob;

  updateStatus('none');

  MessageBus.subscribe('job.submitted', function(event, data) {
    updateStatus('success', 'Started job: ' + data.batch_id);
  });
  MessageBus.subscribe('job.maxed', function() {
    updateStatus('ignored', 'Already enough jobs running');
  });
  MessageBus.subscribe('job.failed', function(event, msg) {
    updateStatus('error', null, msg.formatted);
  });

  function startJob() {
    updateStatus('loading');
    SimCityWebService.submitJob();
  }
  function updateStatus(status, msg, err) {
    vm.submitStatus = status;
    vm.statusMsg = msg || null;
    vm.errorMsg = err || null;
  }
}

})();
