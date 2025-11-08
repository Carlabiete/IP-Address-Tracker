const searchInput = document.getElementById("search-input");
const clearButton = document.getElementById("clear-btn");
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
    return;
  }, 5000);

  script.onload = () => clearTimeout(timeout);
  script.onerror = () => {
    clearTimeout(timeout);
    console.error("Скрипт не загрузился. Проверьте URL:", script.src);
    showMessage("Ошибка загрузки данных");
  };
}

function showIP(data) {
  if (ipAddress !== "") {
    if (data?.bogon) {
      showMessage("Немаршрутизируемый адрес (bogon IP)");
      return;
    } else showMessage("Запрос выполнен");
  } else {
    showMessage("По умолчанию используется IP пользователя");
  }
  displayData(data);
  updateMap(data.loc);
}

function showMessage(message) {
  tipField.textContent = message;
}

function displayData({ ip, country, city, timezone, org }) {
  ipAddressDisplay.textContent = ip;
  locationDisplay.textContent = `${country || "None"}, ${city || "None"}`;
  timezoneDisplay.textContent = timezone
    .replaceAll("/", " / ")
    .replaceAll("_", "-");
  ispDisplay.textContent = org || "None";
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
  const lat = parseFloat(loc[0]);
  const lon = parseFloat(loc[1]);
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
    currentMarker.properties.set({
      balloonContent: `Location: <br>
    Lat: ${lat}<br>
    Lng: ${lon}`,
    });
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

function validateIP(str) {
  const invalidMessages = {
    1: "IP должен быть в формате 255.255.255.255",
    2: "Числа должна быть в диапазоне от 0 до 255",
  };

  if (str === "") return true;

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(str)) {
    showMessage(invalidMessages["1"]);
    return false;
  }

  if (
    !str.split(".").every((segment) => {
      const num = parseInt(segment);
      return num >= 0 && num <= 255;
    })
  ) {
    showMessage(invalidMessages["2"]);
    return false;
  } else {
    return true;
  }
}

clearButton.addEventListener("click", () => {
  if (searchInput.value) searchInput.value = "";
});

searchButton.addEventListener("click", () => {
  if (!validateIP(searchInput.value)) return;
  ipAddress = searchInput.value;
  request(ipAddress);
});
