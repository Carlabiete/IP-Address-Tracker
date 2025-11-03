const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-btn");
const ipAddressDisplay = document.getElementById("ip-display");
const locationDisplay = document.getElementById("location-display");
const timezoneDisplay = document.getElementById("timezone-display");
const ispDisplay = document.getElementById("isp-display");
//const mapHolder = document.getElementById("map");
const themeSwitch = document.getElementById("theme-switch");
const lightTheme = document.getElementById("light-theme");
const darkTheme = document.getElementById("dark-theme");

let currentTheme = "light";
document.documentElement.setAttribute("data-theme", currentTheme);

lightTheme.addEventListener("click", () => {
  if (currentTheme !== "light") {
    currentTheme = "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeSwitch.classList.remove("shift");
    document.getElementById("map").classList.remove("dark-theme");
  }
});

darkTheme.addEventListener("click", () => {
  if (currentTheme !== "dark") {
    currentTheme = "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeSwitch.classList.add("shift");
    document.getElementById("map").classList.add("dark-theme");
  }
});

const IP_API_KEY = "at_yKH4wGfEbDJtwoPMlgBVnZTWBokYV";
let ipAddress = "";

//const MAP_API_KEY = "0bcae193-03fd-45cf-a502-803af4391504";
//const requestLink = `https://api-maps.yandex.ru/2.1/?apikey=${MAP_API_KEY}&lang=ru_RU`;

async function request(ipAddress) {
  const requestLink = `https://geo.ipify.org/api/v2/country,city?apiKey=${IP_API_KEY}&ipAddress=${ipAddress}`;
  try {
    const response = await fetch(requestLink);
    if (!response.ok) {
      throw new Error("some error");
    }
    const data = await response.json();
    displayData(data);
    updateMap(data.location.lat, data.location.lng);
  } catch (error) {
    console.log(error);
    showError(error.message);
  }
}

function displayData({ ip, location, isp }) {
  ipAddressDisplay.textContent = ip;
  locationDisplay.textContent = `${location.country || "None"}, ${
    location.city || "None"
  }`;
  timezoneDisplay.textContent = `UTC ${location.timezone}`;
  ispDisplay.textContent = isp || "None";
}

let map = null;
let currentMarker = null;

function initMap() {
  map = new ymaps.Map("map", {
    center: [0.0, 0.0],
    zoom: 10,
    controls: [],
  });
}

function updateMap(lat, lng) {
  if (!currentMarker) {
    currentMarker = new ymaps.Placemark(
      [lat, lng],
      {
        balloonContent: `Location: <br>
      Lat: ${lat}<br>
      Lng: ${lng}`,
      },
      {
        preset: "islands#redIcon",
      }
    );
    map.geoObjects.add(currentMarker);
    map.setCenter([lat, lng]);
  } else {
    currentMarker.geometry.setCoordinates([lat, lng]);
    map.panTo([lat, lng], {
      duration: 1000,
      timingFunction: "ease-in-out",
    });
  }
}

function showError(error) {
  //alert(error);
}

request(ipAddress);
ymaps.ready(initMap);

searchButton.addEventListener("click", () => {
  ipAddress = searchInput.value;
  request(ipAddress);
});
