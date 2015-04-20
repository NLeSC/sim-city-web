(function(){

'use strict';

angular.module('simCityWebApp').
  service('SimCityWebService', SimCityWebService);

SimCityWebService.$inject = ['$http', 'MessageBus', '$q'];
function SimCityWebService($http, MessageBus, $q) {
  var vm = this;

  vm.deleteTask = deleteTask;
  vm.getTask = getTask;
  vm.overview = overview;
  vm.submitJob = submitJob;
  vm.submitTask = submitTask;
  vm.viewTasks = viewTasks;

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
    return _http('POST', '/explore/simulate/' + model, params)
      .success(function(data, status, headers) {
        var task = {url: headers('Location')};
        task.name = task.url.substr(task.url.lastIndexOf('/') + 1);
        MessageBus.publish('task.submitted', task);
      })
      .error(function(data, status, headers, config, statusText) {
        MessageBus.publish('task.failed', formatHTTPError(data, status, statusText, 'error starting simulation'));
      });
  }

  function viewTasks(simulation, version) {
    return $http.get('/explore/view/simulations/' + simulation + '/' + version);
  }

  function getTask(id) {
    return $http.get('/explore/simulation/' + id);
  }

  function deleteTask(id, rev) {
    return _http('DELETE', '/explore/simulation/' + id, {rev: rev});
  }

  function _http(method, url, params) {
    return $http({
      method: method,
      url: url,
      params: params,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    });
  }

  function overview() {
    return $http.get('/explore/view/totals')
      .then(function(response) {
        return {
          tasks: [
            {name: 'queued',     value: response.data.todo},
            {name: 'processing', value: response.data.locked},
            {name: 'done',       value: response.data.done},
            {name: 'with error', value: response.data.error},
          ],
          jobs: [
            {name: 'active',     value: response.data.active_jobs},
            {name: 'pending',    value: response.data.pending_jobs},
            {name: 'finished',   value: response.data.finished_jobs},
          ],
        };
      }, function(response) {
        var status;
        if (response.status === 0) {
          status = '';
        } else {
          status = '(code ' + response.status + ')';
        }
        return $q.reject('Cannot load infrastructure overview ' + status);
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
