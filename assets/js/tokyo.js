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