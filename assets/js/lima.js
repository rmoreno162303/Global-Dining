var goBack = document.querySelector("#goBack");

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -12.04, lng: -77.04 },
    zoom: 11,
  });
}

window.initMap = initMap;

goBack.addEventListener("click", function () {
	window.location.replace("../../index.html");
});



