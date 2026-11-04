const API_URL = "https://api.open-meteo.com/v1/forecast";

class WeatherApiError extends Error {
  constructor(code, message, status, cause) {
    super(message);
    this.name = "WeatherApiError";
    this.code = code;
    this.status = status;
    if (cause) this.cause = cause;
  }
}

async function fetchCurrentWeather(location, options = {}) {
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
  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 8000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new WeatherApiError("TIMEOUT", `Open-Meteo 요청 시간 초과(${timeoutMs}ms)`, 504, error);
    }
    throw new WeatherApiError("NETWORK", "Open-Meteo 서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.", 503, error);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const status = [401, 403, 429].includes(response.status)
      ? response.status
      : response.status >= 500 ? 502 : 502;
    const messages = {
      401: "Open-Meteo 인증이 필요합니다.",
      403: "Open-Meteo 접근이 거부되었습니다.",
      429: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
    };
    throw new WeatherApiError(
      response.status === 401 ? "UPSTREAM_UNAUTHORIZED" :
        response.status === 403 ? "UPSTREAM_FORBIDDEN" :
        response.status === 429 ? "RATE_LIMITED" : "UPSTREAM_HTTP",
      messages[response.status] || `Open-Meteo 서버 오류(HTTP ${response.status})`,
      status
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (error) {
    throw new WeatherApiError("INVALID_JSON", "날씨 API가 올바른 JSON 데이터를 반환하지 않았습니다.", 502, error);
  }

  const current = json?.current;
  const units = json?.current_units;
  const numericFields = [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "precipitation",
    "weather_code",
    "wind_speed_10m"
  ];
  if (!current || numericFields.some(field =>
    typeof current[field] !== "number" || !Number.isFinite(current[field])
  ) || typeof current.time !== "string" || !current.time) {
    throw new WeatherApiError("INVALID_SCHEMA", "날씨 API 응답 형식이 예상과 다릅니다.", 502);
  }

  return {
    sourceUrl: url.toString(),
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

module.exports = { fetchCurrentWeather, WeatherApiError };
