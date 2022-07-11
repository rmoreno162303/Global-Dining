var goBack = document.querySelector("#goBack");

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.6762, lng: 139.770 },
    zoom: 10,
  });
}

window.initMap = initMap;

goBack.addEventListener("click", function () {
  window.location.replace("../../index.html");
});

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'a0eee688dcmshf0cd55b72775dafp1f835ajsn7ed18ac2d93b',
		'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
	}
};

fetch('https://hotels4.p.rapidapi.com/locations/v2/search?query=tokyo&locale=en_US&currency=', options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));