var goBack = document.querySelector("#goBack");

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 48.85, lng: 2.35 },
    zoom: 10,
  });
}

window.initMap = initMap;

goBack.addEventListener("click", function () {
	window.location.replace("../../index.html");
});



  