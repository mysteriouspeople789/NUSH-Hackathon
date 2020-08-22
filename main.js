function success(position) {
  let latitude = position.coords.latitude; 
  let longitude = position.coords.longitude;
  document.getElementById("demo").innerHTML = latitude + ", " + longitude;
}

function error() {
  alert('Sorry, we are not able to detect your location.');
}

const options = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 27000
};

const watchID = navigator.geolocation.watchPosition(success, error, options);


var keys = []
var counts = []
var ref = firebase.database().ref("coordinates");
ref.on('value', function(snapshot) {
    snapshot.forEach(function(item) {
        var itemVal = item.val();
        keys.push(itemVal);
    });
});

//


function test() {
	
	console.log(coorLatArr);
	console.log(coorLongArr);
}

function checkLocation() {
	let count = 0;
	coorLatArr = []
	coorLongArr = []

	for(let i = 0; i < keys.length; i++) {
		let temp = keys[i];
		let splitTemp = temp.split(", ");
		let tempLat = splitTemp[0];
		let tempLong = splitTemp[1];
		tempLat = parseFloat(tempLat);
		tempLong = parseFloat(tempLong);

		let pos = document.getElementById("demo").innerHTML;
		let splitPos = pos.split(", ");
		let currentLat = splitPos[0];
		let currentLong = splitPos[1];
		currentLat = parseFloat(currentLat);
		currentLong = parseFloat(currentLong);

		if(tempLat > (currentLat - 0.01) && tempLat < (currentLat + 0.01) && tempLong > (currentLong - 0.01) && tempLong < (currentLong + 0.01)) {
					document.getElementById("alert").innerHTML = "You are within 1km of a place visited by a COVID-19 patient while infectious. Please monitor your health carefully.";
					count++;
				}
		if(count == 0) {
			document.getElementById("alert").innerHTML = "This place has not been visited by any COVID-19 patient while infectious";
			document.getElementById("alert").style.color = 'green';
		}
	}
}

	
//

function setIntervalPos() {
	setInterval(checkLocation(), 1000);
}

//setInterval(checkLocation(), 1000);



// const firebaseConfig = {
//   apiKey: "AIzaSyDq8c-UEecGdpqb6jZ8XjLrqvMoAto8XdE",
//   authDomain: "nush-hackathon.firebaseapp.com",
//   databaseURL: "https://nush-hackathon.firebaseio.com",
//   projectId: "nush-hackathon",
//   storageBucket: "nush-hackathon.appspot.com",
//   messagingSenderId: "811610869752",
//   appId: "1:811610869752:web:a0a8202ef5ed8028acd00d",
//   measurementId: "G-L9MVSVGLLW"
// };

// firebase.initializeApp(firebaseConfig);
//firebase.analytics();

/*
arr = [];

var query = firebase.database().ref("nush-hackathon/coordinates").orderByKey();
query.once("value",function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var key = childSnapshot.key;
      var childData = childSnapshot.val();
      arr.push(childData);
  });
});

document.getElementById("demo1").innerHTML = arr;
*/



/*
var ref = firebase.database().ref("coordinates");
ref.once("value")
  .then(function(snapshot) {
    var key = snapshot.key; 
    var childKey = snapshot.child("0").val(); 
    console.log(childKey)
  });
 */

function loadMap() {
	let pos = document.getElementById("demo").innerHTML;
	let splitPos = pos.split(", ");
	currentLat = splitPos[0];
	currentLong = splitPos[1];
	currentLat = parseFloat(currentLat);
	currentLong = parseFloat(currentLong);


	document.cookie = "SameSite=strict"

	var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
	 
	mapboxgl.accessToken = 'pk.eyJ1IjoibXlzdGVyaW91c3Blb3BsZTc4OSIsImEiOiJja2U0aXh6OTAwdGhwMnptd2hxMDk4bnc3In0.RNTFqlK9ERYkwftrrDAv5A';
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: [currentLat, currentLong],
		zoom: 3
	});
/*
	var marker = new mapboxgl.Marker()
	.setLngLat([1.3165605115720258 ,103.76425007874624])
	.addTo(map);*/

	map.addControl(
		new mapboxgl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true
			},
			trackUserLocation: true
		})
	);
}


function start() {
	setIntervalPos();
	loadMap();
}

/*
map.on('load', function() {
  map.addSource('places', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
       'features': [
          {
            'type': 'Feature',
            'properties': {
              'description':
                '<p>hmms</p>',
               'icon': 'theatre'
            },
            'geometry': {
              'type': 'Point',
              'coordinates': [1.3521, 103.8198]
            }
          }
        ]
    }
});
        // Add a layer showing the places.
        map.addLayer({
            'id': 'places',
            'type': 'symbol',
            'source': 'places',
            'layout': {
                'icon-image': '{icon}-15',
                'icon-allow-overlap': true
            }
        });

// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
	closeButton: false,
	closeOnClick: false
});
 
map.on('mouseenter', 'places', function(e) {
// Change the cursor style as a UI indicator.
map.getCanvas().style.cursor = 'pointer';
 
var coordinates = e.features[0].geometry.coordinates.slice();
var description = e.features[0].properties.description;
 
// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
}
 
// Populate the popup and set its coordinates
// based on the feature found.
popup
.setLngLat(coordinates)
.setHTML(description)
.addTo(map);
});
 
map.on('mouseleave', 'places', function() {
map.getCanvas().style.cursor = '';
popup.remove();
});
*/



