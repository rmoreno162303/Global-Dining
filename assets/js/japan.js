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