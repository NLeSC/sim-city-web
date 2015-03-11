(function(){

'use strict';

angular.module('simCityWebApp').
  service('SimCityWebService', SimCityWebService);

SimCityWebService.$inject = ['$http', 'MessageBus'];
function SimCityWebService($http, MessageBus) {
  this.submitJob = submitJob;
  this.submitTask = submitTask;

  function submitJob(host) {
    return $http.post(host ? '/explore/job/' + host : '/explore/job').
      success(function(data) {
        MessageBus.publish('job.submitted', data);
      }).
      error(function(data, status, headers, config, statusText) {
          if (status === 503) {
            MessageBus.publish('job.maxed', {message: 'Already enough jobs running'});
          } else {
            MessageBus.publish('job.failed', formatHTTPError(data, status, statusText, 'error starting job'));
          }
      });
  }

  function submitTask(model, params) {
    return $http({
      method: 'POST',
      url: '/explore/simulate/' + model,
      params: params,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).
    success(function(data, status, headers) {
      var task = {url: headers('Location')};
      task.name = task.url.substr(task.url.lastIndexOf('/') + 1);
      MessageBus.publish('task.submitted', task);
    }).
    error(function(data, status, headers, config, statusText) {
      MessageBus.publish('task.failed', formatHTTPError(data, status, statusText, 'error starting simulation'));
    });
  }
}

function formatHTTPError(data, status, statusText, defaultMsg) {
  var msg = data.error || defaultMsg;
  var httpStatusMsg = '(HTTP status ' + status + ': ' + statusText + ')';

  return {
    message: msg,
    httpStatusMessage: httpStatusMsg,
    formatted: msg + ' ' + httpStatusMsg
  };
}

})();
