var goBack = document.querySelector("#goBack");

let map;

function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: {
			lat: -12.04,
			lng: -77.04
		},
		zoom: 11,
	});
}

window.initMap = initMap;

goBack.addEventListener("click", function () {
	window.location.replace("../../index.html");
});

// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------API CODE--------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// CODE FOR RESTAURANTS API
// Aileen's API Key
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'cecdcbdec0mshd761368c3cea4dbp155534jsn4dcc984b78b4',
		'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
	}
};

fetch('https://travel-advisor.p.rapidapi.com/restaurants/list-by-latlng?latitude=-12.04&longitude=-77.04&limit=10&distance=2&open_now=false&lunit=km&lang=en_US', options)
	.then(response => response.json())
	.then(response => getParams(response.data))
//.catch(err => console.error(err));


function getParams(searchParamsArr) {
	// var searchParamsArr = document.location.search.split('&');
	console.log(searchParamsArr);

	for (var i = 0; i < searchParamsArr.length; i++) {
		var nameTravel = searchParamsArr[i].name
		var webUrl = searchParamsArr[i].web_url
		console.log(nameTravel);
		console.log(webUrl);


		if (nameTravel !== undefined) {
			var restaurants = document.querySelector(".restaurants");
			restaurants.insertAdjacentHTML("beforebegin", `<a href=${webUrl}><li>${nameTravel}</li></a>`)
		}


	}
}

// Code for Currency API
(function onLoad() {
	// set a function for button
	setButtonFunctions();

	// fetch from API when the page loads
	getCurrencyExchangeRates();
})();
// Setting the button function to display the money exchange rate.
function setButtonFunctions() {
	document.getElementById('buttonCurrency').onclick = getCurrencyExchangeRates;
}
// created the variables for the from and to sections while fetching the api. 
function getCurrencyExchangeRates() {
	const from = document.getElementById('inputCurrencyFrom').value;
	const to = document.getElementById('inputCurrencyTo').value;
	fetch('https://currency-exchange.p.rapidapi.com/exchange?q=1.0&from=' + from + '&to=' + to, {
			"method": 'GET',
			"headers": {
				'X-RapidAPI-Key': '398fb245d7msh383d7c9eee5f575p12e203jsn4fecb1f38eaa',
				'X-RapidAPI-Host': 'currency-exchange.p.rapidapi.com'
			}
		})
		// logging the response i get for the exchange rate. 
		.then(response => response.json())
		.then(response => {
			console.log('Currency Exchange API object:');
			console.log(response);
			console.log("\n");
			//  Getting a response from the api and displaying it as the result.
			document.getElementById('currencyResult').innerHTML = 'Result: ' + response;
		})
		.catch(err => {
			console.error(err);
		});
}