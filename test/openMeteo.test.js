const test = require("node:test");
const assert = require("node:assert/strict");
const { fetchCurrentWeather, WeatherApiError } = require("../src/openMeteo");

const originalFetch = global.fetch;

function validResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      current: {
        time: "2026-11-04T10:00",
        temperature_2m: 17,
        relative_humidity_2m: 50,
        apparent_temperature: 16,
        precipitation: 0,
        weather_code: 1,
        wind_speed_10m: 8
      },
      current_units: { temperature_2m: "°C" }
    })
  };
}

test.afterEach(() => {
  global.fetch = originalFetch;
});

test("정상 응답의 날씨 필드를 반환한다", async () => {
  global.fetch = async () => validResponse();
  const result = await fetchCurrentWeather({ latitude: 36.35, longitude: 127.38 });
  assert.equal(result.temperature, 17);
  assert.equal(result.observedAt, "2026-11-04T10:00");
  assert.match(result.sourceUrl, /^https:\/\/api\.open-meteo\.com/);
});

test("네트워크 연결 실패를 NETWORK로 분류한다", async () => {
  global.fetch = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(
    fetchCurrentWeather({ latitude: 36, longitude: 127 }),
    error => error instanceof WeatherApiError && error.code === "NETWORK" && error.status === 503
  );
});

test("요청 시간 초과를 TIMEOUT으로 분류한다", async () => {
  global.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    });
  });
  await assert.rejects(
    fetchCurrentWeather({ latitude: 36, longitude: 127 }, { timeoutMs: 10 }),
    error => error.code === "TIMEOUT" && error.status === 504
  );
});

test("외부 HTTP 429를 요청 제한 오류로 분류한다", async () => {
  global.fetch = async () => ({ ok: false, status: 429 });
  await assert.rejects(
    fetchCurrentWeather({ latitude: 36, longitude: 127 }),
    error => error.code === "RATE_LIMITED" && error.status === 429
  );
});

test("잘못된 JSON을 INVALID_JSON으로 분류한다", async () => {
  global.fetch = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("bad json"); } });
  await assert.rejects(
    fetchCurrentWeather({ latitude: 36, longitude: 127 }),
    error => error.code === "INVALID_JSON" && error.status === 502
  );
});

test("필수 필드가 빠진 응답을 INVALID_SCHEMA로 분류한다", async () => {
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ current: { temperature_2m: 20 } }) });
  await assert.rejects(
    fetchCurrentWeather({ latitude: 36, longitude: 127 }),
    error => error.code === "INVALID_SCHEMA" && error.status === 502
  );
});
