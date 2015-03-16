(function(){
'use strict';

angular.module('simCityWebApp').
  service('LayerService', LayerService);

LayerService.$inject = ['$http'];
function LayerService($http) {
  var vm = this;

  vm.activeBaseLayer = undefined;
  vm.activeLayers = [];
  vm.activateLayer = activateLayer;
  vm.addBaseLayer = addBaseLayer;
  vm.addLayer = addLayer;
  vm.addTileWMSLayers = addTileWMSLayers;
  vm.baseLayers = [];
  vm.inactiveLayers = [];
  vm.showLayers = [];
  vm.deactivateLayer = deactivateLayer;
  vm.insertActiveLayer = insertActiveLayer;
  vm.selectBaseLayer = selectBaseLayer;

  vm.addBaseLayer({
    name: 'bingsat',
    title: 'Satellite',
    source: {
        name: 'Bing Maps',
        type: 'BingMaps',
        key: 'Au9Lj6rpm-ZvnbpxgpTIVTD7cBP_nIGVKA8boyR0Ai8YRrPT8WyELLZnAcq5V40N',
        imagerySet: 'Aerial'
      },
  });
  vm.addBaseLayer({
    name: 'bingroad',
    title: 'Roads',
    source: {
        name: 'Bing Maps',
        type: 'BingMaps',
        key: 'Au9Lj6rpm-ZvnbpxgpTIVTD7cBP_nIGVKA8boyR0Ai8YRrPT8WyELLZnAcq5V40N',
        imagerySet: 'Road',
      },
  });
  vm.addBaseLayer({
    name: 'osm',
    title: 'OpenStreetMaps',
    source: {
      type: 'OSM',
    },
  });

  function deactivateLayer(layer) {
    insertSorted(layer, vm.inactiveLayers);
    remove(layer, vm.activeLayers);
    updateLayers();
  }

  function updateLayers() {
    vm.showLayers = [vm.activeBaseLayer]
      .concat(vm.activeLayers)
      .map(function(l, idx){l.index = idx; return l;});
    console.log(vm.showLayers.map(getName));
  }

  function activateLayer(layer) {
    vm.activeLayers.push(layer); // add as top layer
    remove(layer, vm.inactiveLayers);
    updateLayers();
  }
  function addBaseLayer(layer) {
    if (!vm.activeBaseLayer) {
      vm.selectBaseLayer(layer);
    }
    vm.baseLayers.push(layer);
  }

  function indexOf(layer, layerList) {
    return layerList.map(getName).indexOf(layer.name);
  }

  function remove(layer, layerList) {
    var idx = indexOf(layer, layerList);
    if (idx !== -1) {
      layerList.splice(idx, 1);
    }
    return idx;
  }

  function insertActiveLayer(newIdx, layer) {
    var oldIdx = indexOf(layer, vm.activeLayers);
    if (oldIdx !== newIdx) {
      if (oldIdx !== -1) {
        vm.activeLayers.splice(oldIdx, 1);
        if (newIdx > oldIdx) {
          newIdx--;
        }
      }
      vm.activeLayers.splice(newIdx, 0, layer);
      updateLayers();
    }
  }

  function addLayer(layer) {
    if (vm.activeLayers.map(getName).indexOf(layer.name) === -1 &&
        vm.inactiveLayers.map(getName).indexOf(layer.name) === -1) {
      insertSorted(layer, vm.inactiveLayers);
    }
  }

  function addTileWMSLayers(url) {
    var parser = new ol.format.WMSCapabilities();
    $http.get(url + '?request=getCapabilities')
      .success(function(data) {
        var result = parser.read(data);
        // Copy original array
        var layers = result.Capability.Layer.Layer;
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].queryable === true) {
            vm.addLayer({
              name: layers[i].Name,
              title: layers[i].Title || layers[i].Name,
              source: {
                type: 'TileWMS',
                url: url,
                params: {
                  'LAYERS': layers[i].Name,
                  'TILED': true,
                },
              },
            });
          }
        }
      });
  }

  function selectBaseLayer(layer) {
    // unfortunately, directly selecting does not trigger an update.
    vm.activeBaseLayer = layer;
    updateLayers();
  }
}

function insertSorted(elem, array) {
  // Uses insert sort
  array.push(elem);
  sort(array);
}

function getName(o) {
  return o.name;
}

function sort(array) {
  for (var i = 1; i < array.length; i++) {
    var x = array[i];
    var j = i;
    while (j > 0 && array[j-1].title.toLowerCase() > x.title.toLowerCase()) {
      array[j] = array[j-1];
      j = j - 1;
    }
    array[j] = x;
  }
}

})();
