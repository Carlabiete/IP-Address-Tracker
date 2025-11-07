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

function request(ipAddress) {
  showMessage("Идет запрос...");
  const script = document.createElement("script");
  script.src = `https://ipinfo.io/${ipAddress}/json?callback=showIP`;
  document.body.appendChild(script);

  const timeout = setTimeout(() => {
    showMessage("API не отвечает. Попробуйте позже");
    document.body.removeChild(script);
  }, 5000);

  script.onload = () => clearTimeout(timeout);
  script.onerror = () => {
    clearTimeout(timeout);
    console.error("Скрипт не загрузился. Проверьте URL:", script.src);
    showMessage("Ошибка загрузки данных");
  };
}

function showIP(data) {
  ipAddress !== ""
    ? (tipField.textContent = "Запрос выполнен")
    : (tipField.textContent = "По умолчанию используется IP пользователя");
  displayData(data);
  updateMap(data.loc);
}

function showMessage(message) {
  tipField.textContent = message;
}

function displayData({ ip, country, city, timezone, isp }) {
  ipAddressDisplay.textContent = ip;
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

function updateMap(loc) {
  loc = loc.split(",");
  const lat = loc[0];
  const lon = loc[1];
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
  request(ipAddress);
}

pageLoad();

searchButton.addEventListener("click", () => {
  ipAddress = searchInput.value;
  request(ipAddress);
});
