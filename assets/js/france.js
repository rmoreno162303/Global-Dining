var goBack = document.querySelector("#goBack");

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 46, lng: 3 },
    zoom: 5.5,
  });
}

window.initMap = initMap;

goBack.addEventListener("click", function () {
	window.location.replace("./index.html");
});



