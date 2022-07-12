var goBack = document.querySelector("#goBack");
var travelResultTextEl = document.querySelector("#travelResultText");
var travelResultContentEl = document.querySelector("#travelResultContent");

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.65, lng: -103.34 },
    zoom: 11,
  });
}

window.initMap = initMap;

goBack.addEventListener("click", function () {
  window.location.replace("../../index.html");
});


const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '17dd0426edmsh13121a26fbfbab2p198620jsnb665b009c96d',
		'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
	}
};




fetch('https://travel-advisor.p.rapidapi.com/restaurants/list-by-latlng?latitude=36&longitude=138&limit=10&distance=2&open_now=false&lunit=km&lang=en_US', options)
	.then(response => response.json())
	.then(response => getParams(response.data))
	.catch(err => console.error(err));





function getParams(searchParamsArr) {
  // var searchParamsArr = document.location.search.split('&');
  console.log(searchParamsArr);
  var name = searchParamsArr[0].name
  var webUrl = searchParamsArr[0].web_url
  console.log(name);
  console.log(webUrl);
    
  }

 // Code for Currency API
  
 (function onLoad()
 {
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
 function getCurrencyExchangeRates()
   {
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