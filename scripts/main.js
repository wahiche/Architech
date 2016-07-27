$(function(){
	var city;
	var cityButton = $('#searchForCity');
	var cityInput = $('#cityInput');
	var iconUrl = "http://openweathermap.org/img/w/";
	
	//date info
	var date = new Date();
	var year;
	var month;
	var day;
	var currentDay;
	var lastDay;
	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	
	//current weather
	var apiCurrentWeatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=";
	var currentWeatherContainer = $('#currentWeatherContainer');
	
	
	function searchCurrentWeatherByCity(city) {
		$.ajax({
			dataType: "json",
			url: apiCurrentWeatherUrl + city + "&units=metric&APPID=75a7a90070959c9e857f49e023173a0d",
			success: currentWeatherSuccess,
			error: errorFunc
		});
	}
	function currentWeatherSuccess(e) {	
		if (e.name.toLowerCase() === cityInput.val().toLowerCase()) {
			showCurrentWeather(e);
		} else {
			alert("Sorry is that a real place?  Please check again");	
		}
	}
	function showCurrentWeather(weather) {
		$('<h1 />', {
        text: weather.name
		}).appendTo(currentWeatherContainer);
		$('<div />', {
        "class": 'desc',
        html: weather.weather[0].description
		}).appendTo(currentWeatherContainer);
		$('<img />', {
        "class": 'icon',
        src: iconUrl + weather.weather[0].icon + '.png'
		}).appendTo(currentWeatherContainer);
		$('<div />', {
				"id": "weatherInfo",
        "class": 'weather-info',
    }).appendTo(currentWeatherContainer);
		
		var weatherInfo = document.getElementById("weatherInfo");
		
		$('<div />', {
        "class": 'weather-info-item humidity',
        html: "<label>Humidity</label>" + "<div>" + weather.main.humidity + '%</div>'
		}).appendTo(weatherInfo);
		$('<div />', {
        "class": 'weather-info-item pressure',
        html: "<label>Current Pressure</label>" + "<div>" +(weather.main.pressure/10) + 'kPa</div>'
		}).appendTo(weatherInfo);
	}

	//7 day forcast
	var apiForecastUrl = "http://api.openweathermap.org/data/2.5/forecast/daily?q=";
	var forecastContainer = $('#forecastContainer');
	
	function searchForecastByCity(city) {
		$.ajax({
			dataType: "json",
			url: apiForecastUrl + city + "&units=metric&cnt=7&APPID=75a7a90070959c9e857f49e023173a0d",
			success: forecastSuccess,
			error: errorFunc
		});
	}
	
	function forecastSuccess(e) {	
		if (e.city.name.toLowerCase() === cityInput.val().toLowerCase()) {
			showForecast(e.list);
		} else {
			alert("Sorry is that a real place?  Please check again");
		}
	}
	
	function getDate() {
		year = date.getYear();
		month = date.getMonth();
		day = date.getDay();
		currentDay = date.getDate();
		lastDay = new Date((new Date(year , month , 1)) -1 );
		
		if (date === lastDay) {
			month = date.getMonth() + 1;
			currentDay = 1;
		} else {
			currentDay = date.getDate();
			date.setDate(date.getDate() + 1);
		}
		return {
			day, currentDay, month
		}
	}
	
	function addDate(i) {
		$('<div />', {
        "class": 'date',
        html: "<div>" + days[day] + "</div>" + monthNames[month] + " " + currentDay
		}).appendTo(document.getElementById("forecastItem"+[i]));
	}
	
	function addDesc(i,v) {
		$('<div />', {
        "class": 'desc',
        html: v.weather[0].description
		}).appendTo(document.getElementById("forecastItem"+[i]));
	}
	
	function addIcon(i,v) {
		$('<img />', {
        "class": 'icon',
        src: iconUrl + v.weather[0].icon + '.png'
		}).appendTo(document.getElementById("forecastItem"+[i]));
	}
	
	function addTemperature(i,v) {
		var forecastItem = document.getElementById("forecastItem"+[i]);
		forecastItem.innerHTML = forecastItem.innerHTML + ("<ul id='temperatureInfo" + i + "'></ul>");
		$('<li />', {
        "class": 'temp-info',
        html: "<dl><dt>Day</dt><dd>" + Math.floor(v.temp.day) + "&#176;</dd><dt>Eve</dt><dd>" + Math.floor(v.temp.eve) + "&#176;</dd><dt>Max</dt><dd>" + Math.floor(v.temp.max) + "&#176;</dd><dt>Min</dt><dd>" + Math.floor(v.temp.min) + "&#176;</dd></dl>"
		}).appendTo(document.getElementById("temperatureInfo"+[i]));
	}
	
	function showForecast(forecast) {
		getWeeklyMinTemperatures(forecast);
		getWeeklyMaxTemperatures(forecast);
		avgPressure(forecast);
		$.each(forecast, function(i,v){
			$('<div />', {
				"id": "forecastItem" + i,
        "class": 'forecast-item',
        }).appendTo(forecastContainer);
			getDate();
			addDate(i);
			addDesc(i,v);
			addIcon(i,v);
			addTemperature(i,v);
		});
		buildChart();
		cityInput.val('');
	}
	
	function errorFunc(e) {
		console.log(e);
	}
	
	var maxTemperatureArray = [];
	function getWeeklyMaxTemperatures(forecast){
		for (item in forecast) {
			maxTemperatureArray.push(forecast[item].temp.max);
		}
	}
	var minTemperatureArray = [];
	function getWeeklyMinTemperatures(forecast){
		for (item in forecast) {
			minTemperatureArray.push(forecast[item].temp.min);
		}
	}

	function avgPressure(forecast) {
		var pressureArray = [];
		var avgPressureValue = 0;
		
		for (var item in forecast) {
			pressureArray.push(forecast[item].pressure);
		}
		
		$.each(pressureArray, function(i,v) {
			avgPressureValue += v;
		});
		
		$('<div />', {
        "class": 'weather-info-item avg-pressure',
        html: "<label>Average Pressure</label>" + "<div>" + ((avgPressureValue/pressureArray.length)/10).toFixed(2) + 'kPa</div>'
		}).appendTo(document.getElementById("weatherInfo"));
	}
	
	cityButton.on('click', function(){
		if ($('.forecast-item').length != 0) {
			$('.forecast-item').remove();
			$('.current-weather > *').remove();
		}
		searchCurrentWeatherByCity(cityInput.val());
		searchForecastByCity(cityInput.val());
		resets();
	});
	
	function resets() {
		dateArray = [];
		temperatureArray = [];
		d = new Date();
		currentDay = d.getDate();
	}
	
	//Events
	cityInput.on('keypress', function(evt) {
		if (evt.keyCode == 13 ) {
			event.preventDefault();
			cityButton.click();
		}
	})
	
	cityInput.focus();
	
	//Charting of temperature for the day
	function buildChart() {
		var dateArray = [];
		for (var i = 0; i < 7; i++) {
			dateArray.push(days[getDate().day]);
		}
		$('#container').highcharts({
				chart: {
						type: 'line'
				},
				title: {
						text: 'Daily Max Temperatures'
				},
				xAxis: {
						categories: dateArray
				},
				yAxis: {
						title: {
								text: 'Temperature(°C)'
						}
				},
				plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
				series: [{
						name: 'Max Temperature',
						data: maxTemperatureArray
				},{
						name: 'Min Temperature',
						data: minTemperatureArray
				}]
		});
	}
});