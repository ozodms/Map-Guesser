import { geojson } from './geojsonmap.js';

var map = L.map('map').setView([0, 0], 2);

const baseLayer = L.tileLayer('https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
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
            e.target.setStyle({
                fillOpacity: 0.5,
                opacity: 1
            });
        },
        mouseout: function (e) {
            e.target.setStyle({
                fillOpacity: 0,
                opacity: 0
            });
        },
        click: function (e) {
            onCountryClick(e, feature);
        }
    });
}


L.geoJSON(geojson, {
    style: styleFeature,
    onEachFeature: onEachFeature
}).addTo(map);


const questionElement = document.getElementById('question-container__question');
const counterElement = document.getElementById('question-container__counter');
const messageElement = document.getElementById('message-container');

let lastCountry = null;
let streakCounter = 0;


function getRandomCountry() {
    const countryNames = geojson.features.map(function (feature) {
        return feature.properties.name;
    });
    let newCountry;
    do {
        newCountry = countryNames[Math.floor(Math.random() * countryNames.length)];
    } while (newCountry === lastCountry);
    lastCountry = newCountry;
    return newCountry;
}


let currentCountry = getRandomCountry();
questionElement.textContent = currentCountry;
counterElement.textContent = 'Streak: ' + streakCounter;

function onCountryClick(e, feature) {
    const clickedCountry = feature.properties.name;

    if (clickedCountry === currentCountry) {
        messageElement.textContent = "✅ Correct!";
        messageElement.style.color = "green";
        streakCounter++;
    } else {
        messageElement.textContent = "❌ Wrong!";
        messageElement.style.color = "red";
        streakCounter = 0;
    }

    counterElement.textContent = 'Streak: ' + streakCounter;

    currentCountry = getRandomCountry();
    questionElement.textContent = currentCountry;
}
