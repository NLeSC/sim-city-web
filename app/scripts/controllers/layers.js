(function(){

'use strict';

angular.module('simCityWebApp')
  .controller('LayerCtrl', LayerController);

LayerController.$inject = ['LayerService'];

function LayerController(LayerService) {
  var vm = this;
  vm.activate = activate;
  vm.layerService = LayerService;
  vm.selectTerrain = selectTerrain;

  vm.moveLayer = function(newIdx, layer) {
    vm.layerService.insertActiveLayer(newIdx, layer);
  };

  function activate() {
    vm.layerService.activateLayer(vm.currentActivateLayer);
    delete vm.currentActivateLayer;
  }
  function selectTerrain(layer) {
    vm.layerService.selectBaseLayer(layer);
  }
}


})();
