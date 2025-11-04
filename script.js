const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-btn");
const tipField = document.getElementById("tip");
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

let ipAddress = "";

async function request(ipAddress) {
  const requestLink = `http://ip-api.com/json/${ipAddress}`;
  try {
    const response = await fetch(requestLink);
    if (!response.ok) {
      throw new Error("Ошибка сети");
    }
    const data = await response.json();
    if (data.status !== "success") {
      throw new Error("Некорректные данные");
    }
    ipAddress !== ""
      ? (tipField.textContent = "Запрос выполнен")
      : (tipField.textContent = "По умолчанию используется IP пользователя");
    displayData(data);
    updateMap(data.lat, data.lon);
  } catch (error) {
    console.log(error);
    showError(error.message);
  }
}

function showError(error) {
  tipField.textContent = error;
}

function displayData({ query, country, city, timezone, isp }) {
  ipAddressDisplay.textContent = query;
  locationDisplay.textContent = `${country || "None"}, ${city || "None"}`;
  timezoneDisplay.textContent = timezone
    .replaceAll("/", " / ")
    .replaceAll("_", "-");
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

function updateMap(lat, lon) {
  if (!currentMarker) {
    currentMarker = new ymaps.Placemark(
      [lat, lon],
      {
        balloonContent: `Location: <br>
      Lat: ${lat}<br>
      Lng: ${lon}`,
      },
      {
        preset: "islands#redIcon",
      }
    );
    map.geoObjects.add(currentMarker);
    map.setCenter([lat, lon]);
  } else {
    currentMarker.geometry.setCoordinates([lat, lon]);
    map.panTo([lat, lon], {
      duration: 1000,
      timingFunction: "ease-in-out",
    });
  }
}

async function pageLoad() {
  await ymaps.ready(initMap);
  await request(ipAddress);
}

pageLoad();

searchButton.addEventListener("click", () => {
  ipAddress = searchInput.value;
  console.log("*", ipAddress, "*");
  request(ipAddress);
});
