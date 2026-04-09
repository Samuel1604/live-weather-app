// const fetchData = new Promise((resolve, reject) => {
//   const data = false; // Simulating a failed fetch operation
//   if (data) {
//     resolve("Data fetched successfully");
//   } else {
//     reject("Failed to fetch data");
//   }
// });
// fetchData
//   .then((result) => console.log(result))
//   .catch((error) => console.error(error))
//   .finally(() => console.log("Fetch operation completed"));
// const checkScore = new Promise((resolve, reject) => {
//   const won = false; // Simulating a game outcome
//   if (won) {
//     resolve("Your team won!");
//   } else {
//     reject("Your team lost.");
//   }
// });
// checkScore
//   .then((wan) => console.log(wan))
//   .catch((err) => console.error(err))
//   .finally(() => console.log("Game over"));
// fetch("https://jsonplaceholder.typicode.com/posts/1")
//   .then((response) => response.json())
//   .then((data) => console.log(data))
//   .catch((err) => console.error(err.message));
const weatherIcons = {
    clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png", // Sunny
    cloudy: "https://cdn-icons-png.flaticon.com/512/414/414927.png", // Cloudy
    rain: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png", // Rainy
    snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png", // Snowy
    default: "https://cdn-icons-png.flaticon.com/512/3313/3313998.png", // Default weather icon
};
const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Drizzle: Light",
    53: "Drizzle: Moderate",
    55: "Drizzle: Dense",
    61: "Rain: Slight",
    63: "Rain: Moderate",
    65: "Rain: Heavy",
    71: "Snow fall: Slight",
    73: "Snow fall: Moderate",
    75: "Snow fall: Heavy",
    80: "Rain showers: Slight",
    81: "Rain showers: Moderate",
    82: "Rain showers: Violent",
    95: "Thunderstorm: Slight or moderate",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};
const input = document.getElementById("city");
const result = document.getElementById("weather-result");
const searchState = document.getElementById("search-state");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const retryState = document.getElementById("retry-state");
const search = document.getElementById("search");
const states = [searchState, loadingState, result, errorState];
const showState = (state) => {
    states.forEach((item) => item.classList.remove("active"));
    state.classList.add("active");
};
const clearResult = () => {
    result.replaceChildren();
};
const clearError = () => {
    errorState.replaceChildren(retryState);
};
const renderError = (message) => {
    const errorText = document.createElement("p");
    errorText.className = "error-message";
    errorText.textContent = message;
    errorText.style.color = "#FF3333";
    errorText.style.fontWeight = "bolder";
    errorText.style.fontSize = "16px";
    clearError();
    errorState.prepend(errorText);
    showState(errorState);
};
const getWeather = async () => {
    const cityInput = input.value.trim();
    if (!cityInput) {
        renderError("Please enter a city name.");
        return;
    }
    clearError();
    clearResult();
    showState(loadingState);
    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityInput}`);
        if (!geoResponse.ok) {
            throw new Error("Failed to fetch location data");
        }
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }
        const { latitude, longitude, name } = geoData.results[0];
        // console.log(latitude, longitude, name);
        const weather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&current_weather_units=temperature_2m&timezone=auto`);
        if (!weather.ok) {
            throw new Error(`Failed to fetch ${cityInput} weather`);
        }
        // console.log(weather)
        const weatherData = await weather.json();
        // console.log(weatherData)
        if (!weatherData.current_weather) {
            throw new Error(`${cityInput} Weather not found`);
        }
        // console.log(weather);
        const { temperature, weathercode, is_day } = weatherData.current_weather;
        // console.log(is_day);
        const temp_unit = weatherData.current_weather_units.temperature;
        const is_day_text = is_day == 1 ? "Day" : "Night";
        const city = document.createElement("p");
        city.className = "city";
        city.textContent = name;
        const temp = document.createElement("p");
        temp.className = "temperature";
        const description = document.createElement("p");
        description.className = "description";
        const timeOfDay = document.createElement("p");
        timeOfDay.className = "time-of-day";
        const weatherCard = document.createElement("div");
        weatherCard.className = "weather-card";
        const weatherIcon = document.createElement("img");
        const getIcon = (weather_code) => {
            let icon = weather_code == 0
                ? weatherIcons.clear
                : [1, 2, 3, 45, 48].includes(weather_code)
                    ? weatherIcons.cloudy
                    : [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather_code)
                        ? weatherIcons.rain
                        : [71, 73, 75].includes(weather_code)
                            ? weatherIcons.snow
                            : weatherIcons.default;
            return icon;
        };
        weatherIcon.src = getIcon(weathercode) ?? "";
        weatherIcon.alt = weatherCodes[weathercode] ?? "Weather icon";
        weatherIcon.className = "weather-icon";
        description.textContent = weatherCodes[weathercode] ?? "Weather update";
        timeOfDay.textContent = is_day_text;
        temp.textContent = `${temperature} ${temp_unit}`;
        // const resultText = `The current weather of ${city} is ${weatherCodes[weather_code]} with a temperature of ${temp}, ${is_day_text} ${weatherIcon}`;
        weatherCard.append(weatherIcon, description, timeOfDay, temp);
        const checkAgain = document.createElement("button");
        checkAgain.className = "check-again";
        checkAgain.textContent = "Check another city";
        checkAgain.addEventListener("click", goBack);
        const subtitle = document.querySelector(".subtitle");
        clearResult();
        result.append(weatherCard, checkAgain);
        subtitle.innerHTML = `Current weather of ${city.textContent}`;
        subtitle.style.color = "#fff";
        showState(result);
    }
    catch (error) {
        if (error instanceof Error) {
            renderError(error.message);
            return;
        }
        renderError("Something went wrong. Please try again.");
    }
};
search.addEventListener("click", () => {
    getWeather();
});
const goBack = () => {
    clearError();
    clearResult();
    input.value = "";
    showState(searchState);
    input.focus();
};
retryState.addEventListener("click", goBack);
showState(searchState);
export {};
//# sourceMappingURL=script.js.map