const express = require("express");
const path = require("path");
const { fetchCurrentWeather } = require("./src/openMeteo");
const { readLastGoodWeather, saveLastGoodWeather } = require("./src/lastGoodStore");

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

app.get("/api/weather", async (_req, res) => {
  try {
    const weather = await fetchCurrentWeather(location);
    const now = new Date();
    const record = {
      source: "Open-Meteo",
      location: { ...location },
      timezone: "Asia/Seoul",
      fetchedAt: now.toISOString(),
      fetchedAtKST: formatKST(now),
      data: weather
    };

    // 정상 응답을 받은 경우에만 마지막 정상 데이터를 갱신합니다.
    await saveLastGoodWeather(record);
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

app.get("/api/last-good", async (_req, res) => {
  try {
    const lastGood = await readLastGoodWeather();
    res.json({ success: true, hasLastGood: Boolean(lastGood), lastGood });
  } catch (error) {
    console.error("Last-good read error:", error.message);
    res.status(500).json({ success: false, error: "저장된 정상 데이터를 읽지 못했습니다." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, service: "open-meteo-weather-api" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
