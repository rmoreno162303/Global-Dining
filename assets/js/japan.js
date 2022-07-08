goBack.addEventListener("click", function () {
	window.location.replace("./index.html");
});

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35, lng: 138 },
    zoom: 5.5,
  });
}

window.initMap = initMap;

import { _MY_API_KEY } from './config.js';

fetch('https://hotels4.p.rapidapi.com/locations/v2/search?query=Japan&locale=en_US&currency=USD', options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));