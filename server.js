const express = require("express");
const path = require("path");
const { fetchCurrentWeather } = require("./src/openMeteo");
const { readLastGoodWeather, saveLastGoodWeather } = require("./src/lastGoodStore");
const { readWeatherHistory, saveDailyWeatherRecord } = require("./src/weatherHistoryStore");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const location = {
  city: process.env.CITY_NAME || "Daejeon",
  latitude: Number(process.env.LATITUDE || 36.3504),
  longitude: Number(process.env.LONGITUDE || 127.3845)
};

function formatKST(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date);
}

const SIMULATED_FAILURES = {
  "401": { status: 401, message: "인증이 필요합니다. (시뮬레이션)" },
  "403": { status: 403, message: "접근이 거부되었습니다. (시뮬레이션)" },
  "429": { status: 429, message: "요청 횟수가 너무 많습니다. (시뮬레이션)" },
  offline: { status: 503, message: "네트워크 연결을 사용할 수 없습니다. (시뮬레이션)" },
  schema: { status: 502, message: "응답 데이터 형식이 올바르지 않습니다. (시뮬레이션)" }
};

app.get("/api/weather", async (req, res) => {
  const simulate = String(req.query.simulate || "").toLowerCase();
  if (simulate === "timeout") {
    // 실제 외부 API를 기다리는 대신 짧은 지연 후 시간 초과 상황을 재현합니다.
    await new Promise(resolve => setTimeout(resolve, 1800));
    return sendSimulatedFailure(res, 504, "응답 시간이 초과되었습니다. (시뮬레이션)");
  }
  if (SIMULATED_FAILURES[simulate]) {
    const failure = SIMULATED_FAILURES[simulate];
    return sendSimulatedFailure(res, failure.status, failure.message);
  }

  try {
    const weather = await fetchCurrentWeather(location);
    const now = new Date();
    const record = {
      source: "Open-Meteo",
      location: { ...location },
      timezone: "Asia/Seoul",
      fetchedAt: now.toISOString(),
      fetchedAtKST: formatKST(now),
      sourceUrl: weather.sourceUrl,
      data: weather
    };

    // 정상 응답을 받은 경우에만 마지막 정상 데이터를 갱신합니다.
    await saveLastGoodWeather(record);
    await saveDailyWeatherRecord(record);
    res.json({ success: true, ...record });
  } catch (error) {
    console.error("Weather API error:", error.message);
    let lastGood = null;
    try {
      lastGood = await readLastGoodWeather();
    } catch (storeError) {
      console.error("Last-good storage error:", storeError.message);
    }

    res.status(502).json({
      success: false,
      error: "새 날씨 정보를 가져오지 못했습니다.",
      detail: error.message,
      lastGood,
      hasLastGood: Boolean(lastGood)
    });
  }
});

async function sendSimulatedFailure(res, status, message) {
  let lastGood = null;
  try {
    lastGood = await readLastGoodWeather();
  } catch (error) {
    console.error("Last-good storage error:", error.message);
  }
  return res.status(status).json({
    success: false,
    simulated: true,
    error: message,
    detail: message,
    lastGood,
    hasLastGood: Boolean(lastGood)
  });
}

app.get("/api/last-good", async (_req, res) => {
  try {
    const lastGood = await readLastGoodWeather();
    res.json({ success: true, hasLastGood: Boolean(lastGood), lastGood });
  } catch (error) {
    console.error("Last-good read error:", error.message);
    res.status(500).json({ success: false, error: "저장된 정상 데이터를 읽지 못했습니다." });
  }
});

app.get("/api/history", async (_req, res) => {
  try {
    const records = await readWeatherHistory();
    res.json({ success: true, timezone: "Asia/Seoul", count: records.length, records });
  } catch (error) {
    console.error("Weather history read error:", error.message);
    res.status(500).json({ success: false, error: "날씨 기록을 읽지 못했습니다." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, service: "open-meteo-weather-api" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
