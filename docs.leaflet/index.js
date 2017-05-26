var info;
var marker;
var highlight_layers = [];
var map;

// Get things started
setup();

//Perform a GET request to given url and return the results as a JSON object.
function httpGetSync(url) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", url, false);
  xhttp.send();
  return JSON.parse(xhttp.responseText);
}

function getJSON(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.status != 200 || xhr.readyState != 4) return;
    cb(JSON.parse(xhr.responseText));
  }
  xhr.send();
};

// Main setup to build the map
function setup() {
  initMap();
  addClickHandler();
}

// Use Mapzen.js to build the map!
function initMap() {
  L.Popup = L.Popup.extend({
      getEvents: function () {
          var events = L.DivOverlay.prototype.getEvents.call(this);
          if (this.options.keepInView) {
              events.moveend = this._adjustPan;
          }
          return events;
      },
  });

  L.Mapzen.apiKey = 'search-xDYkNp8';
  map = L.Mapzen.map('map');
  map.setView([27.996, -82.594], 9);

}

// Add click event handling to perform the reverse geocoding and draw the results on the map.
function addClickHandler() {
  map.on('click', function (e) {
    clearLayers();

    // const url = 'https://gist.githubusercontent.com/trescube/226ab960d8fb1b6a2b75acb0933248ce/raw/1f1706c9d5581bbe58327408fb337204cf345e8d';
    // const url = 'https://gist.githubusercontent.com/trescube/226ab960d8fb1b6a2b75acb0933248ce/raw/555ecf7f766366b424423f6a819d3c73837b8212/manholes_subset.geojson';
    const url = 'https://gist.githubusercontent.com/trescube/226ab960d8fb1b6a2b75acb0933248ce/raw/bc7ac97995e4c8b99ca78c9e2780cc2fd8b785c8/manholes_subset.geojson';

    getJSON(url, (data) => {
      console.log(data.features.length);
      addGeojson(data);
    });

  });
}

// Draw the POI marker (just geojson with points, no polygons)
function dropMarker(place) {
  // if previous marker existed, remove it
  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.geoJson(place, {
    onEachFeature: function (feature, layer) {
      // show label when marker is clicked
      var label = '<table>';
      label += '<tr><th>Layer</th><th>Name</th></tr>';

      layers.forEach((value) => {
        if (feature.properties[value]) {
          label += '<tr>';
          label += '<td>' + value + '</td>';
          label += '<td><b>' + feature.properties[value] + '</b></td>';
          label += '</tr>';
        }
      });

      label += '</table>';

      layer.bindPopup(label, { autoClose: false, closeButton: false} );
    }
  }).addTo(map);
}

//Update the info box with given data
function updateInfo(label, parentType, parentName) {
  info.update(label, parentType, parentName);
}

function clearLayers() {
  highlight_layers.forEach((layer) => {
    map.removeLayer(layer);
  })
}

// Draw the polygon(s) in the given geojson on the map.
function addGeojson(geojson, fillOpacity, color, lineWeight) {
  highlight_layers.push(L.geoJson(geojson, {
    style: function (feature) {
      return {
        weight: 1,
        color: color,
        opacity: 0.7,
        weight: lineWeight,
        fillOpacity: fillOpacity
      };
    }
  }).addTo(map));
}

// Control in the upper right corner of the map
function addInfoBox() {
  // control that shows state info on hover
  info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function () {
    this._div.innerHTML =  '<input name="placetype" type="radio" value="region" checked="checked">Regions</input><br>'
    this._div.innerHTML += '<input name="placetype" type="radio" value="county">Counties</input><br>'
    this._div.innerHTML += '<input name="placetype" type="radio" value="locality">Cities</input><br>'
    this._div.innerHTML += '<input name="placetype" type="radio" value="neighbourhood">Neighbourhoods</input>'
  };

  info.addTo(map);
}
