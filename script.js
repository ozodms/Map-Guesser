import { geojson } from './geojsonmap.js';

var map = L.map('map').setView([0, 0], 2);
var geoJsonLayer;

var baseLayer = L.tileLayer('https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

function styleFeature() {
    return {
        color: "blue",
        weight: 2,
        fillColor: "blue",
        fillOpacity: 0,
        opacity: 0,
        className: 'country-hover'
    };
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: function (e) {
            if (!answeredCountries.has(feature.properties.name)) {
                e.target.setStyle({
                    fillOpacity: 0.5,
                    opacity: 1
                });
            }
        },
        mouseout: function (e) {
            if (!answeredCountries.has(feature.properties.name)) {
                e.target.setStyle({
                    fillOpacity: 0,
                    opacity: 0
                });
            }
        },
        click: function (e) {
            if (!answeredCountries.has(feature.properties.name)) {
                onCountryClick(e, feature);
            }
        }
    });
}

var countryLayers = {};

function initializeMap() {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }

    countryLayers = {};

    geoJsonLayer = L.geoJSON(geojson, {
        style: styleFeature,
        onEachFeature: function (feature, layer) {
            countryLayers[feature.properties.name] = layer;
            onEachFeature(feature, layer);
        }
    }).addTo(map);
}

var questionElement = document.getElementById('question-container__question');
var counterElement = document.getElementById('question-container__counter');
var messageElement = document.getElementById('message-container');
var resetButton = document.getElementById('reset-button');

var allCountries = [];
var currentIndex = 0;
var correctCount = 0;
var wrongCount = 0;
var answeredCountries = new Set();
var currentCountry = null;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function resetGame() {
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    answeredCountries.clear();

    initializeMap();

    allCountries = shuffleArray(geojson.features.map(feature => feature.properties.name)).filter(Boolean);

    currentCountry = getNextCountry();

    updateUI();
}

function getNextCountry() {
    while (currentIndex < allCountries.length) {
        var nextCountry = allCountries[currentIndex++];
        if (!answeredCountries.has(nextCountry)) {
            return nextCountry;
        }
    }
    return null;
}

function onCountryClick(e, feature) {
    var clickedCountry = feature.properties.name;

    if (!clickedCountry || !currentCountry) {
        return;
    }

    if (answeredCountries.has(clickedCountry)) {
        return;
    }

    var isCorrect = clickedCountry === currentCountry;

    if (isCorrect) {
        messageElement.textContent = "✅ Correct!";
        messageElement.style.color = "green";
        correctCount++;
        e.target.setStyle({
            fillColor: "green",
            color: "green",
            fillOpacity: 0.5,
            opacity: 1
        });
    } else {
        messageElement.textContent = "❌ Wrong!";
        messageElement.style.color = "red";
        wrongCount++;

        e.target.setStyle({
            fillColor: "red",
            color: "red",
            fillOpacity: 0.5,
            opacity: 1
        });

        var correctLayer = countryLayers[currentCountry];
        if (correctLayer) {
            correctLayer.setStyle({
                fillColor: "green",
                color: "green",
                fillOpacity: 0.5,
                opacity: 1
            });
        }
    }

    answeredCountries.add(currentCountry);
    answeredCountries.add(clickedCountry);
    currentCountry = getNextCountry();
    updateUI();
}

function updateUI() {
    questionElement.textContent = currentCountry || "Game Over!";
    counterElement.textContent = `Correct: ${correctCount} | Wrong: ${wrongCount} | Total: ${allCountries.length}`;
}

resetButton.addEventListener("click", resetGame);
initializeMap();
resetGame();
