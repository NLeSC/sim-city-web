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
  vm.deactivateLayer = deactivateLayer;
  vm.getVectorLayer = getVectorLayer;
  vm.getImageLayer = getImageLayer;
  vm.inactiveLayers = [];
  vm.moveActiveLayer = moveActiveLayer;
  vm.removeVectorLayer = removeVectorLayer;
  vm.removeImageLayer = removeImageLayer;
  vm.selectBaseLayer = selectBaseLayer;
  vm.showLayers = [];

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

  function deactivateLayer(layerId) {
    var layer = remove(layerId, vm.activeLayers);
    if (layer) {
      insertSorted(layer, vm.inactiveLayers);
      updateLayers();
    }
  }

  function updateLayers() {
    vm.showLayers = [vm.activeBaseLayer]
      .concat(vm.activeLayers)
      .map(function(l, idx){l.index = idx; return l;});
  }

  function activateLayer(layerId) {
    var layer = remove(layerId, vm.inactiveLayers);
    if (layer) {
      vm.activeLayers.push(layer); // add as top layer
      updateLayers();
    }
  }
  function addBaseLayer(layer) {
    layer.id = layer.name;
    layer.source.name = layer.id;
    vm.baseLayers.push(layer);
    if (!vm.activeBaseLayer) {
      vm.selectBaseLayer(layer.id);
    }
  }

  function indexOf(layerId, layerList) {
    return layerList.map(getId).indexOf(layerId);
  }

  function remove(layerId, layerList) {
    var idx = indexOf(layerId, layerList);
    if (idx !== -1) {
      return layerList.splice(idx, 1)[0];
    }
  }

  function moveActiveLayer(newIdx, layerId) {
    var oldIdx = indexOf(layerId, vm.activeLayers);
    if (oldIdx !== newIdx) {
      var layer = vm.activeLayers.splice(oldIdx, 1)[0];
      if (newIdx > oldIdx) {
        newIdx--;
      }
      vm.activeLayers.splice(newIdx, 0, layer);
      updateLayers();
    }
  }

  function addLayer(layer, type) {
    layer.id = layer.name + '_' + type;
    layer.contentType = type;
    layer.source.name = layer.id;
    if (indexOf(layer.id, vm.activeLayers) === -1 &&
        indexOf(layer.id, vm.inactiveLayers) === -1) {
      insertSorted(layer, vm.inactiveLayers);
    }
    return layer.id;
  }

  function addImageLayer(layer) {
    return addLayer(layer, 'Image');
  }

  function addVectorLayer(layer) {
    return addLayer(layer, 'Vector');
  }

  function getLayer(name, type) {
    var layerId = name + '_' + type;
    var idx = indexOf(layerId, vm.activeLayers);
    if (idx !== -1) {
      return vm.activeLayers[idx];
    }
    idx = indexOf(layerId, vm.inactiveLayers);
    if (idx !== -1) {
      return vm.inactiveLayers[idx];
    }
  }

  function getImageLayer(name) {
    return getLayer(name, 'Image');
  }
  function getVectorLayer(name) {
    return getLayer(name, 'Vector');
  }

  function removeLayer(name, type) {
    var layerId = name + '_' + type;
    return (remove(layerId, vm.activeLayers) ||
            remove(layerId, vm.inactiveLayers));
  }

  function removeImageLayer(name) {
    return removeLayer(name, 'Image');
  }
  function removeVectorLayer(name) {
    return removeLayer(name, 'Vector');
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

  function selectBaseLayer(layerId) {
    // unfortunately, directly selecting does not trigger an update.
    var idx = indexOf(layerId, vm.baseLayers);
    vm.activeBaseLayer = vm.baseLayers[idx];
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
