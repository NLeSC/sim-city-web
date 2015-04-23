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
    vm.layerService.moveActiveLayer(newIdx, layer.id);
  };

  function activate() {
    vm.layerService.activateLayer(vm.currentActivateLayer.id);
    delete vm.currentActivateLayer;
  }
  function selectTerrain(layer) {
    vm.layerService.selectBaseLayer(layer.id);
  }
}


})();
