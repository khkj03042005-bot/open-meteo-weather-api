const API_URL = "https://api.open-meteo.com/v1/forecast";

async function fetchCurrentWeather(location) {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    timezone: "Asia/Seoul"
  }).toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Open-Meteo 요청 시간 초과(8초)");
    }
    throw new Error("Open-Meteo 서버에 연결할 수 없습니다.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Open-Meteo HTTP ${response.status}`);
  }

  const json = await response.json();
  const current = json.current;
  const units = json.current_units;

  if (
    !current ||
    typeof current.temperature_2m !== "number" ||
    typeof current.relative_humidity_2m !== "number" ||
    typeof current.apparent_temperature !== "number" ||
    typeof current.precipitation !== "number" ||
    typeof current.weather_code !== "number" ||
    typeof current.wind_speed_10m !== "number"
  ) {
    throw new Error("날씨 API 응답 형식이 예상과 다릅니다.");
  }

  return {
    observedAt: current.time,
    temperature: current.temperature_2m,
    temperatureUnit: units?.temperature_2m || "°C",
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    humidityUnit: units?.relative_humidity_2m || "%",
    precipitation: current.precipitation,
    precipitationUnit: units?.precipitation || "mm",
    weatherCode: current.weather_code,
    windSpeed: current.wind_speed_10m,
    windSpeedUnit: units?.wind_speed_10m || "km/h"
  };
}

module.exports = { fetchCurrentWeather };
