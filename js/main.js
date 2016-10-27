function AppViewModel() {
  var self = this;
  self.filterText = ko.observable();
  self.listView = $('.list-view');
  self.rightContent = $('.right');
  self.mobileFilter = $('.mobile-filter-input-group');

  self.interestingPoints = ko.observableArray([{
    'title': 'Central Park',
    'location': {
      'lat': 40.782824,
      'lng': -73.965570
    },
    'id': 0
  }, {
    'title': 'Metropolitan Opera',
    'location': {
      'lat': 40.773006,
      'lng': -73.984148
    },
    'id': 1
  }, {
    'title': 'Times Square',
    'location': {
      'lat': 40.759155,
      'lng': -73.985136
    },
    'id': 2
  }, {
    'title': 'New York Stock Exchange',
    'location': {
      'lat': 40.707097,
      'lng': -74.011260
    },
    'id': 3
  }, {
    'title': 'United Nations Headquarters',
    'wikiTitle': 'Headquarters of the United Nations',
    'location': {
      'lat': 40.7494561,
      'lng': -73.9693231
    },
    'id': 4
  }, {
    'title': 'Statue of Liberty',
    'location': {
      'lat': 40.689201,
      'lng': -74.043824
    },
    'id': 5
  }, {
    'title': 'Grand Central Terminal',
    'location': {
      'lat': 40.7521563,
      'lng': -73.9777261
    },

    'id': 6
  }, {
    'title': 'Metropolitan Museum of Art',
    'location': {
      'lat': 40.779705,
      'lng': -73.963260
    },
    'id': 7
  }, {
    'title': 'Ground Zero',
    'wikiTitle': 'World Trade Center site',
    'location': {
      'lat': 40.7122,
      'lng': -74.0104
    },
    'id': 8
  }, {
    'title': 'Empire State Building',
    'location': {
      'lat': 40.748701,
      'lng': -73.985627
    },
    'id': 9
  }, {
    'title': 'Yankee Stadium',
    'location': {
      'lat': 40.829707,
      'lng': -73.925697
    },
    'id': 10
  }]);

  /*
  Decide which locations should be visible based on the filter text.
  Also filter the markers on the map.
  */
  self.filterLocations = ko.computed(function() {
    var filter = this.filterText();
    if (typeof filter == 'undefined') {
      return this.interestingPoints();
    } else {
      return ko.utils.arrayFilter(this.interestingPoints(), function(location) {
        var containsFilterVal = location.title.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
        if (location.marker) {
          location.marker.setVisible(containsFilterVal);
        }
        return containsFilterVal;
      });
    }
  }, self);

  /*
  Animate the marker and display the info for the location
  */
  self.displayInfoWindow = function(location) {
    location.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      location.marker.setAnimation(null);
    }, 750);
    self.populateInfoWindow(location, self.infoWindow);
    self.adjustListView();
  };

  self.setupMap = function() {

    //create the map
    self.map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 40.782824,
        lng: -73.965570
      },
      zoom: 25,
      styles: styles
    });

    self.infoWindow = new google.maps.InfoWindow({
      content: 'This is an info window.'
    });

    //clear the marker on close
    self.infoWindow.addListener('closeclick', function() {
      self.infoWindow.marker = null;
    });

    //close the info window if the user clicks on the map
    self.map.addListener('click', function() {
      if (self.infoWindow.map !== null) {
        self.infoWindow.marker = null;
        self.infoWindow.close();
      }
    });

    self.createMarkers(self.interestingPoints());

    window.onresize = self.fitBounds;

  };
  /*
  Create the markers for the view model's list of locations
  */
  self.createMarkers = function(locations) {

    var bounds = new google.maps.LatLngBounds();

    //creates a yellow marker image
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + 'FFFF24' +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));

    //create markers for each location
    for (var i = 0; i < locations.length; i++) {
      var position = locations[i].location;
      var title = locations[i].title;

      var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i,
        map: self.map,
        icon: markerImage
      });

      marker.location = locations[i];

      //when the marker is clicked animate with bounce
      //and stop the bouncing animation later
      marker.addListener('click', function() {
        self.map.panTo(this.getPosition());
        this.setAnimation(google.maps.Animation.BOUNCE);
        (function(marker) {
          setTimeout(function() {
            marker.setAnimation(null);
          }, 750);
        })(this);
        self.populateInfoWindow(this.location);
      });

      locations[i].marker = marker;

      bounds.extend(marker.position);
    }
    self.bounds = bounds;
    self.map.fitBounds(bounds);
  };

  self.populateInfoWindow = function(location) {
    var marker = location.marker;
    if (self.infoWindow.marker != marker) {
      // Clear the infoWindow content to give the streetview time to load.
      self.infoWindow.setContent('');
      self.infoWindow.marker = marker;


      var content = '<div id="title">' + location.title + '</div>' +
        '<div id="pano">No Street View Found</div>' +
        '<div id="wiki-content"></div>';

      self.infoWindow.setContent(content);
      self.infoWindow.open(self.map, marker);

      self.retrieveWikiInfo(location);
      self.getPanoramaView(marker);

    }
  };

  //send a request to retrieve the Wikipedia information and add it to the info window
  self.retrieveWikiInfo = function(location) {
    if (!location.wikiContent) {
      var queryURL = self.createWikipediaUrl(location);
      $.ajax({
        url: queryURL,
        dataType: 'jsonp',
        type: 'GET',
        success: function(data) {
          location.wikiContent = 'Unable to load Wikipedia content.';
          try {
            var id = Object.keys(data.query.pages)[0];
            var summary = data.query.pages[id].extract;
            if (summary !== null && typeof summary !== 'undefined') {
              location.wikiContent = summary;
            }
          } catch (e) {
            location.wikiContent = 'Unable to load Wikipedia content';
          }
          $('#wiki-content').text(location.wikiContent);
        },
        error: function() {
          location.wikiContent = 'Unable to load Wikipedia content';
          $('#wiki-content').text(location.wikiContent);
        }
      });
    } else {
      $('#wiki-content').text(location.wikiContent);
    }
  };

  //creates the Wikipedia URL based on the location's information
  self.createWikipediaUrl = function(location) {
    var title = location.wikiTitle;
    if (!title) {
      title = location.title;
    }

    //get two sentences from the pages intro
    var queryURL = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + title +
      '&prop=extracts|images&imlimit=2&exintro=&explaintext=&exsentences=2&format=json';
    return queryURL;
  };

  //Use the Google Street View Service to get a panorama to display
  self.getPanoramaView = function(marker) {

    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;


    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          },
          visible: true
        };

        //place in 'pano' div
        new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        $('#pano').text('No Street View Found');
      }
    }
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  };

  /*
  Slide the left handed list view as needed
  */
  self.adjustListView = function() {
    self.listView.toggleClass('open');
    self.rightContent.toggleClass('minimized');
    self.mobileFilter.toggleClass('visible');
  };

  /*
  Recenter the map to fit the markers
  */
  self.fitBounds = function() {
    self.map.fitBounds(self.bounds);
  };

  self.fitBoundsAndCloseListView = function() {
    self.fitBounds();
    self.adjustListView();
  };
}

function initMap() {

  // Activates knockout.js
  var viewModel = new AppViewModel();
  ko.applyBindings(viewModel);
  viewModel.setupMap();
}

function googleError() {
  var map = $('#map');
  map.addClass('error');
  map.html('<table class="error"><tr><td>Error loading neighborhood map</td></tr></table>');
}
