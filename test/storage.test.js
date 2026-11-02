const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

async function isolatedStore(moduleName) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "weather-store-test-"));
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.copyFile(path.join(__dirname, "..", "src", moduleName), path.join(root, "src", moduleName));
  return { root, store: require(path.join(root, "src", moduleName)), cleanup: () => fs.rm(root, { recursive: true, force: true }) };
}

function weatherRecord(fetchedAt, temperature) {
  return {
    source: "Open-Meteo",
    location: { city: "Daejeon", latitude: 36.3504, longitude: 127.3845 },
    timezone: "Asia/Seoul",
    fetchedAt,
    fetchedAtKST: "2026. 10. 30. 오후 3:00:00",
    data: {
      observedAt: "2026-10-30T15:00", temperature, temperatureUnit: "°C",
      feelsLike: temperature - 1, humidity: 55, humidityUnit: "%",
      precipitation: 0, precipitationUnit: "mm", windSpeed: 10,
      windSpeedUnit: "km/h", weatherCode: 1
    }
  };
}

test("KST 날짜 기준으로 기록하고 같은 날짜는 최신 값으로 갱신한다", async () => {
  const { store, cleanup } = await isolatedStore("weatherHistoryStore.js");
  try {
    // 2026-10-29 15:30 UTC는 한국 시간으로 2026-10-30 00:30이다.
    const first = weatherRecord("2026-10-29T15:30:00.000Z", 18);
    const second = weatherRecord("2026-10-29T16:00:00.000Z", 19);
    await store.saveDailyWeatherRecord(first);
    const records = await store.saveDailyWeatherRecord(second);
    assert.equal(records.length, 1);
    assert.equal(records[0].dateKST, "2026-10-30");
    assert.equal(records[0].temperature, 19);
  } finally {
    await cleanup();
  }
});

test("다른 KST 날짜는 별도 기록으로 보관한다", async () => {
  const { store, cleanup } = await isolatedStore("weatherHistoryStore.js");
  try {
    await store.saveDailyWeatherRecord(weatherRecord("2026-10-29T14:59:00.000Z", 17));
    const records = await store.saveDailyWeatherRecord(weatherRecord("2026-10-29T15:01:00.000Z", 18));
    assert.equal(records.length, 2);
    assert.deepEqual(records.map(x => x.dateKST), ["2026-10-30", "2026-10-29"]);
  } finally {
    await cleanup();
  }
});

test("마지막 정상 데이터는 저장 후 다시 읽을 수 있다", async () => {
  const { store, cleanup } = await isolatedStore("lastGoodStore.js");
  try {
    const record = weatherRecord("2026-10-30T06:00:00.000Z", 18.5);
    await store.saveLastGoodWeather(record);
    assert.deepEqual(await store.readLastGoodWeather(), record);
  } finally {
    await cleanup();
  }
});

test("저장 데이터가 없으면 마지막 정상 데이터는 null이다", async () => {
  const { store, cleanup } = await isolatedStore("lastGoodStore.js");
  try {
    assert.equal(await store.readLastGoodWeather(), null);
  } finally {
    await cleanup();
  }
});

test("이틀 기록에 원천 URL과 관측 시각을 보존한다", async () => {
  const { store, cleanup } = await isolatedStore("weatherHistoryStore.js");
  try {
    const first = weatherRecord("2026-10-28T15:00:00.000Z", 17);
    first.data.sourceUrl = "https://api.open-meteo.com/v1/forecast?latitude=36.3504";
    const records = await store.saveDailyWeatherRecord(first);
    assert.equal(records[0].source, "Open-Meteo");
    assert.equal(records[0].sourceUrl, first.data.sourceUrl);
    assert.equal(records[0].observedAt, first.data.observedAt);
  } finally {
    await cleanup();
  }
});

test("서로 다른 두 KST 날짜의 기온 차이를 계산한다", () => {
  const { compareLatestDays } = require("../src/dayComparison");
  const result = compareLatestDays([
    { dateKST: "2026-10-30", temperature: 18.5, temperatureUnit: "°C" },
    { dateKST: "2026-10-29", temperature: 16.0, temperatureUnit: "°C" }
  ]);
  assert.equal(result.comparable, true);
  assert.equal(result.delta, 2.5);
  assert.equal(result.latest.dateKST, "2026-10-30");
});

test("서로 다른 KST 날짜가 2개 미만이면 비교하지 않는다", () => {
  const { compareLatestDays } = require("../src/dayComparison");
  assert.equal(compareLatestDays([{ dateKST: "2026-10-30", temperature: 18, temperatureUnit: "°C" }]), null);
});
