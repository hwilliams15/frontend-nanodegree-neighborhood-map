function AppViewModel() {
    self = this;
    self.filterText = ko.observable();
    self.interestingPoints = ko.observableArray([
      {
        'title':'Central Park',
        'location': {'lat': 40.782824,'lng': -73.965570},
        'id':0
      },
      {
        'title':'Metropolitan Opera',
        'location': {'lat': 40.773006,'lng': -73.984148},
        'id': 1
      },{
        'title':'Times Square',
        'location': {'lat': 40.759155,'lng': -73.985136},
        'id': 2
      },{
        'title':'New York Stock Exchange',
        'location': {'lat': 40.707097,'lng': -74.011260},
        'id': 3
      },{
        'title':'United Nations Headquarters',
        'wikiTitle': 'Headquarters of the United Nations',
        'location': {'lat': 40.749128,'lng': -73.967971},
        'id': 4
      },{
        'title':'Madame Tussauds New York',
        'location': {'lat': 40.756976,'lng': -73.988831},
        'id': 5
      },{
        'title':'Bronx Zoo',
        'location': {'lat': 40.850530,'lng': -73.876692},
        'id': 6
      },{
        'title':'Metropolitan Museum of Art',
        'location': {'lat': 40.779705,'lng': -73.963260},
        'id': 7
      },{
        'title': 'Ground Zero',
        'wikiTitle':'World Trade Center site',
        'location': {'lat': 40.712224,'lng': -74.010413},
        'id': 8
      },{
        'title':'Empire State Building',
        'location': {'lat': 40.748701,'lng': -73.985627},
        'id': 9
      },{
        'title':'Yankee Stadium',
        'location': {'lat': 40.829707,'lng': -73.925697},
        'id': 10
      }
    ]);

    self.filterLocations = function(){
      self.infoWindow.close();
      var listElems = $('.list-elem');
      var list = self.interestingPoints();
      for(var i = 0;i<list.length;i++){
        if(list[i].title.toLowerCase().indexOf(self.filterText().toLowerCase())<0){
          listElems[i].style.display = "none";
          list[i].marker.setMap(null);
        }else{
          listElems[i].style.display = "block";
          list[i].marker.setMap(map);
        }
      }
    };

    self.displayInfoWindow = function(location){
      location.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
        location.marker.setAnimation(null);
      },750);
      populateInfoWindow(location, self.infoWindow);
    };

}

// Activates knockout.js
var viewModel = new AppViewModel();
ko.applyBindings(viewModel);

var map;
var markers;
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    styles: styles
  });

  createMarkers(viewModel.interestingPoints(),map);
}

function createMarkers(locations,map){

  var bounds = new google.maps.LatLngBounds();
  viewModel.infoWindow = new google.maps.InfoWindow({
    content: 'This is an info window.'
  });

  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
      map: map
    });

    marker.location = locations[i];

    marker.addListener('click', function() {
      this.setAnimation(google.maps.Animation.BOUNCE);
      (function(marker){
        setTimeout(function(){
          marker.setAnimation(null);
        },750);
      })(this);
      populateInfoWindow(this.location, viewModel.infoWindow);
    });

    locations[i].marker = marker;

    bounds.extend(marker.position);
  }
  map.fitBounds(bounds);
}

function populateInfoWindow(location, infoWindow) {
  var marker = location.marker;
  if (infoWindow.marker != marker) {
    // Clear the infoWindow content to give the streetview time to load.
    infoWindow.setContent('');
    infoWindow.marker = marker;
    // Make sure the marker property is cleared if the infoWindow is closed.
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          // infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        // infoWindow.setContent('<div>' + marker.title + '</div>' +
        //   '<div>No Street View Found</div>');
      }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infoWindow on the correct marker.
    retrieveWikiInfo(location,infoWindow);
    infoWindow.open(map, marker);
  }
}
function createWikipediaUrl(location){
  var title = location.wikiTitle;
  if(!title){
    title = location.title;
  }
  var queryURL = "https://en.wikipedia.org/w/api.php?action=query&titles="+title+
  "&prop=extracts|images&imlimit=2&exintro=&explaintext=&exsentences=2&format=json";
  return queryURL;
}

function retrieveWikiInfo(location,infoWindow){
  if(!location.wikiContent){
    var queryURL = createWikipediaUrl(location);
    console.log(queryURL);
    $.ajax( {
        url: queryURL,
        dataType: 'jsonp',
        type: 'POST',
        headers: { 'Api-User-Agent': 'Example/1.0' },
        success: function(data) {
          var id = Object.keys(data.query.pages)[0];
          location.wikiContent = '<div>' + location.title + '</div>';
          if(id!=null){
            var summary = data.query.pages[id].extract;
            if(summary!=null){
               location.wikiContent = '<div>' + location.title + '</div>'+
               '<div>'+summary+'</div>';
               infoWindow.setContent(location.wikiContent);
            }
          }
        },
        error: function(){
          location.wikiContent = '<div>' + marker.title +
            '</div><div>Unable to load Wikipedia content</div>';
          infoWindow.setContent(location.wikiContent);
        }
    } );
  }
  else{
    infoWindow.setContent(location.wikiContent);
  }
}

$('.hamburger').click(function(){
  $('.list-view').toggleClass('open');
  $('.right').toggleClass('shift');
})
