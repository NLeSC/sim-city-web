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
  vm.addImageLayer = addImageLayer;
  vm.addVectorLayer = addVectorLayer;
  vm.addLayersFromOWS = addLayersFromOWS;
  vm.baseLayers = [];
  vm.inactiveLayers = [];
  vm.showLayers = [];
  vm.deactivateLayer = deactivateLayer;
  vm.insertActiveLayer = insertActiveLayer;
  vm.selectBaseLayer = selectBaseLayer;

  vm.addBaseLayer({
    name: 'toner',
    title: 'Toner B&W',
    source: {
      type: 'Stamen',
      layer: 'toner',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    },
  });
  vm.addBaseLayer({
    name: 'watercolor',
    title: 'Watercolor',
    source: {
      type: 'Stamen',
      layer: 'watercolor',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    },
  });
  vm.addBaseLayer({
    name: 'bingsat',
    title: 'Satellite',
    source: {
        type: 'BingMaps',
        key: 'Au9Lj6rpm-ZvnbpxgpTIVTD7cBP_nIGVKA8boyR0Ai8YRrPT8WyELLZnAcq5V40N',
        imagerySet: 'Aerial'
      },
  });
  vm.addBaseLayer({
    name: 'bingroad',
    title: 'Roads',
    source: {
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
  }

  function activateLayer(layer) {
    vm.activeLayers.push(layer); // add as top layer
    remove(layer, vm.inactiveLayers);
    updateLayers();
  }
  function addBaseLayer(layer) {
    layer.id = layer.name;
    layer.source.name = layer.id;
    if (!vm.activeBaseLayer) {
      vm.selectBaseLayer(layer);
    }
    vm.baseLayers.push(layer);
  }

  function indexOf(layer, layerList) {
    return layerList.map(getId).indexOf(layer.id);
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

  function addLayer(layer, type) {
    layer.id = layer.name + '_' + type;
    layer.contentType = type;
    layer.source.name = layer.id;
    if (vm.activeLayers.map(getId).indexOf(layer.id) === -1 &&
        vm.inactiveLayers.map(getId).indexOf(layer.id) === -1) {
      insertSorted(layer, vm.inactiveLayers);
    }
    return layer;
  }

  function addImageLayer(layer) {
    return addLayer(layer, 'Image');
  }

  function addVectorLayer(layer) {
    return addLayer(layer, 'Vector');
  }

  function addLayersFromOWS(url) {
    var parser = new ol.format.WMSCapabilities();
    $http.get(url + '?service=wms&request=getCapabilities')
      .success(function(data) {
        var result = parser.read(data);
        var layers = result.Capability.Layer.Layer;

        // Copy original array
        for (var i = 0; i < layers.length; i++) {
          vm.addImageLayer({
            name: layers[i].Name,
            title: layers[i].Title || layers[i].Name,
            source: {
              type: 'TileWMS',
              url: url,
              params: {
                'SERVICE': 'WMS',
                'LAYERS': layers[i].Name,
                'TILED': true,
              },
            },
          });
          if (layers[i].queryable === true) {
            vm.addVectorLayer({
              name: layers[i].Name,
              title: layers[i].Title || layers[i].Name,
              source: {
                type: 'GeoJSON',
                url: url + '?service=wfs&request=getFeature&outputFormat=application/json&typeName=' + layers[i].Name,
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

function getId(o) {
  return o.id;
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
