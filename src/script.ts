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

const weatherIcons: Record<string, string> = {
  clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png", // Sunny
  cloudy: "https://cdn-icons-png.flaticon.com/512/414/414927.png", // Cloudy
  rain: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png", // Rainy
  snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png", // Snowy
  default: "https://cdn-icons-png.flaticon.com/512/3313/3313998.png", // Default weather icon
};

const weatherCodes: Record<number, string> = {
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
const input = document.getElementById("city") as HTMLInputElement;
const result = document.getElementById("weather-result") as HTMLDivElement;
const getWeather = async () => {
  const cityInput: String = input.value;
  // console.log(cityInput);
  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${cityInput}`,
  )
    .then((response) => response.json())
    .catch((err) => err.message);
  if (!geoResponse.results || geoResponse.results.length === 0) {
    throw new Error("City not found");
  }

  interface Response {
    latitude: number;
    longitude: number;
    name: string;
  }
  const { latitude, longitude, name }: Response = geoResponse.results[0];
  // console.log(`Location: ${name}, ${country}`);
  const weather = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&current_units=temperature_2m&timezone=auto`,
  )
    .then((response) => response.json())
    .catch((err) => err.message);
  if (!weather.current) {
    throw new Error(`${cityInput} Weather not found`);
  }
  interface CurrentWeather {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  }
  console.log(weather)
  const { temperature_2m, weather_code, is_day }: CurrentWeather =
    weather.current;
  console.log(is_day);
  const temp_unit = weather.current_units.temperature_2m;
  const is_day_text = is_day == 1 ? "Day" : "Night";
  const city = document.createElement("p") as HTMLParagraphElement;
  city.className = "city";
  city.textContent = name;
  const temp = document.createElement("p") as HTMLParagraphElement;
  temp.className = "temperature";
  const description = document.createElement("p") as HTMLParagraphElement;
  description.className = "description";
  const timeOfDay = document.createElement("p") as HTMLParagraphElement;
  timeOfDay.className = "time-of-day";
  const weatherCard = document.createElement("div") as HTMLDivElement;
  weatherCard.className = "weather-card";
  const weatherIcon = document.createElement("img") as HTMLImageElement;
  const getIcon = (weather_code: number) => {
    let icon =
      weather_code == 0
        ? weatherIcons.clear
        : [1, 2, 3, 45, 48].includes(weather_code)
          ? weatherIcons.cloudy
          : [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(
                weather_code,
              )
            ? weatherIcons.rain
            : [71, 73, 75].includes(weather_code)
              ? weatherIcons.snow
              : weatherIcons.default;
    return icon;
  };
  weatherIcon.src = getIcon(weather_code) ?? "";
  weatherIcon.alt = weatherCodes[weather_code] ?? "Weather icon";
  weatherIcon.className = "weather-icon";
  description.textContent = weatherCodes[weather_code] ?? "Weather update";
  timeOfDay.textContent = is_day_text;
  temp.textContent = `${temperature_2m} ${temp_unit}`;
  // const resultText = `The current weather of ${city} is ${weatherCodes[weather_code]} with a temperature of ${temp}, ${is_day_text} ${weatherIcon}`;
  weatherCard.append(city, weatherIcon, description, timeOfDay, temp);
  result.replaceChildren(weatherCard);
};

const search = document.getElementById("search") as HTMLButtonElement;
search.addEventListener("click", () => {
  getWeather();
  
});
