"use strict";
const $W = (function () {

    const cityInfoMap = new Map();
    let currentSelectedCityId;
    let lastTimeStamp;

    const WEATHER_INTERVAL_MINUTES = 180;
    const WEATHER_INTERVAL_MILLISECONDS = WEATHER_INTERVAL_MINUTES * 60 * 1000;

    const mapSettings = {
        lat: 51.505,
        lng: -0.09,
        zoom: 9,
        weatherApiBaseUrl: 'https://api.openweathermap.org/data/2.5/weather?appid=9d702b6c59ae04252971af7429287196&&units=metric',
        tileLayerUrl: 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
        tileLayerOptions: {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 30,
            id: 'streets-v9',
            accessToken: 'pk.eyJ1IjoiaGFuYW1wIiwiYSI6ImNqdXl5aWttcjAyamQ0NHBtOWxxMDBpZnYifQ.7tWGRaW_alk0lm3nOLKD8A'
        }
    };

    const selectedMarkerStyle = {
        iconOptions: {
            color: "rgb(255,0,000)",
            fillColor: "rgb(255,0,000)",
            circleColor: "rgb(255,0,000)",
            fillOpacity: 1
        }
    };
    const defaultMarkerStyle = {
        iconOptions: {
            color: "rgb(0,0,255)",
            fillColor: "rgb(0,0,255)",
            circleColor: "rgb(0,0,255)",
            fillOpacity: 1
        }
    };
    const goToMarkerDefinitions = {
        zoom: 5,
        flyToOptions: {
            animate: true,
            duration: 0.8
        }
    };

    const cityIdNameMap = new Map([
        [2643743, 'London'],
        [293397, 'Tel Aviv'],
        [4164138, 'Miami'],
        [5128638, 'New York'],
        [6359304, 'Madrid']
    ]);

    class cityInfo {
        constructor(id, name, weather, marker) {
            this.id = id;
            this.name = name;
            this.weather = weather;
            this.marker = marker;
        }
    }

    const map = L.map('mapid').setView([mapSettings.lat, mapSettings.lng], mapSettings.zoom);

    function init() {
        lastTimeStamp = new Date().getTime();
        populateCitySelectElement();
        currentSelectedCityId = document.getElementById("citySelect").value;
        addMapLayer();
        getWeather(currentSelectedCityId);
    }

    function populateCitySelectElement() {
        const fragment = document.createDocumentFragment();
        const selectList = document.getElementById("citySelect");
        cityIdNameMap.forEach((val, key) => {
            const option = document.createElement("option");
            option.value = key;
            option.text = val;
            fragment.appendChild(option);
        });
        selectList.appendChild(fragment);
    }

    function addMapLayer() {
        L.tileLayer(mapSettings.tileLayerUrl, mapSettings.tileLayerOptions).addTo(map);
    }

    function getWeather(cityId) {
        if (cityInfoMap.has(cityId) && !isGetWeatherAgain()) {
            handleSelectedCity(cityId);
        } else {
            fetch(mapSettings.weatherApiBaseUrl + '&id=' + cityId)
                .then(function (response) {
                    return response.json();
                })
                .then(function (weatherJson) {
                    updateNewSelectedCity(weatherJson, cityId);
                });
        }
    }

    function updateNewSelectedCity(weatherJson, cityId) {
        updateCityDetailsInMap(weatherJson, cityId);
        handleSelectedCity(cityId);
    }

    function updateCityDetailsInMap(cityWeather, cityId) {
        if (!cityInfoMap.has(cityId)) {
            cityInfoMap.set(cityId, new cityInfo(cityId, cityIdNameMap.get(cityId), cityWeather));
        } else {
            cityInfoMap.weather = cityWeather;
        }
    }

    function handleSelectedCity(cityId) {
        setMarkerOnSelectedCity(cityId);
        populateCityDetailsUI(cityId);
    }

    function setMarkerOnSelectedCity(cityId) {
        if (cityInfoMap.has(cityId)) {
            const selectedCityInfo = cityInfoMap.get(cityId);
            const selectedCityWeather = selectedCityInfo.weather;
            const point = L.latLng(selectedCityWeather.coord.lat, selectedCityWeather.coord.lon);
            if (selectedCityInfo.marker) {
                selectedCityInfo.marker.setStyle(selectedMarkerStyle);
            } else {
                setNewMarker(point, cityId);
            }
            map.flyTo(point, goToMarkerDefinitions.zoom, goToMarkerDefinitions.flyToOptions);

        }
    }

    function setNewMarker(point, cityId) {
        if (cityInfoMap.has(cityId) && point) {
            const marker = new L.Marker.SVGMarker(point, selectedMarkerStyle).addTo(map).on('click', e => {
                onMarkerClick(e);
            });
            marker.cityId = cityId;
            cityInfoMap.get(cityId).marker = marker;
        }
    }

    function onMarkerClick(event) {
        document.getElementById("citySelect").value = event.target.cityId;
        onCityChange();
    }


    function populateCityDetailsUI(cityId) {
        if (cityInfoMap.has(cityId)) {
            const cityWeather = cityInfoMap.get(cityId).weather;
            document.getElementById("description").value = cityWeather.weather[0].description;
            document.getElementById("wind").value = `speed ${cityWeather.wind.speed}, ${cityWeather.wind.speed} degrees`;
            document.getElementById("temperature").value = cityWeather.main.temp;
            document.getElementById("humidity").value = `${cityWeather.main.humidity}%`;
        }
    }

    function onCityChange() {
        const newSelectedCityId = document.getElementById("citySelect").value;
        if (newSelectedCityId !== currentSelectedCityId) {
            getWeather(newSelectedCityId);
            cityInfoMap.get(currentSelectedCityId).marker.setStyle(defaultMarkerStyle);
            currentSelectedCityId = newSelectedCityId;
        }
    }

    function isGetWeatherAgain() {
        let getWeather = false;
        const now = new Date().getTime();
        const delta = now - lastTimeStamp;
        if (delta >= WEATHER_INTERVAL_MILLISECONDS) {
            lastTimeStamp = now;
            getWeather = true;
        }
        return getWeather;
    }

    init();

    return {
        onCityChange: function () {
            onCityChange();
        }
    };
})();

