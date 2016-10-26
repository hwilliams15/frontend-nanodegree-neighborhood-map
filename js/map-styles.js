/* Styles to customize the map */
var styles = [{
  featureType: 'water',
  stylers: [{
    color: '#45e7ef'
  }]
}, {
  'featureType': 'landscape',
  'stylers': [{
    'color': '#e4e2e0'
  }]
}, {
  featureType: 'administrative',
  elementType: 'labels.text.stroke',
  stylers: [{
    color: '#ffffff'
  }, {
    weight: 6
  }]
}, {
  featureType: 'administrative',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#ff00d4'
  }]
}, {
  featureType: 'road.highway',
  elementType: 'geometry.stroke',
  stylers: [{
    color: '#4cf75a'
  }, {
    lightness: -40
  }]
}, {
  featureType: 'transit.station',
  stylers: [{
    weight: 9
  }, {
    hue: '#ff00d4'
  }]
}, {
  featureType: 'road.highway',
  elementType: 'labels.icon',
  stylers: [{
    visibility: 'off'
  }]
}, {
  featureType: 'water',
  elementType: 'labels.text.stroke',
  stylers: [{
    lightness: 100
  }]
}, {
  featureType: 'water',
  elementType: 'labels.text.fill',
  stylers: [{
    lightness: -100
  }]
}, {
  'featureType': 'poi',
  'elementType': 'geometry.fill',
  'stylers': [{
    'color': '#acacac'
  }]
}, {
  featureType: 'road.highway',
  elementType: 'geometry.fill',
  stylers: [{
    color: '#4cf75a'
  }, {
    lightness: -25
  }]
}];
