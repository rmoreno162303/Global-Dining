var goBack = document.querySelector("#goBack");

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.65, lng: -103.34 },
    zoom: 11,
  });
}

window.initMap = initMap;

goBack.addEventListener("click", function () {
<<<<<<< HEAD:assets/js/mexico.js
	window.location.replace("./index.html");
});
=======
	window.location.replace("../../index.html");
});



>>>>>>> 58fd50eff8f96115f12ad865af10de595a6b6de3:assets/js/guadalajara.js
