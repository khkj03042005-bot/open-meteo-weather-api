const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const HISTORY_FILE = path.join(DATA_DIR, "weather-history.json");

async function readWeatherHistory() {
  try {
    const content = await fs.readFile(HISTORY_FILE, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch (error) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) return [];
    throw error;
  }
}

// KST 날짜별로 최신 정상 수신값을 하나씩 보관합니다.
async function saveDailyWeatherRecord(record) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const dateKST = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date(record.fetchedAt));

  const records = await readWeatherHistory();
  const dailyRecord = {
    dateKST,
    fetchedAt: record.fetchedAt,
    fetchedAtKST: record.fetchedAtKST,
    source: record.source || "Open-Meteo",
    sourceUrl: record.data.sourceUrl || record.sourceUrl || "https://open-meteo.com/",
    observedAt: record.data.observedAt,
    city: record.location.city,
    temperature: record.data.temperature,
    temperatureUnit: record.data.temperatureUnit,
    feelsLike: record.data.feelsLike,
    humidity: record.data.humidity,
    humidityUnit: record.data.humidityUnit,
    precipitation: record.data.precipitation,
    precipitationUnit: record.data.precipitationUnit,
    windSpeed: record.data.windSpeed,
    windSpeedUnit: record.data.windSpeedUnit,
    weatherCode: record.data.weatherCode
  };

  const existingIndex = records.findIndex(item => item.dateKST === dateKST && item.city === record.location.city);
  if (existingIndex >= 0) records[existingIndex] = dailyRecord;
  else records.push(dailyRecord);

  records.sort((a, b) => b.dateKST.localeCompare(a.dateKST));
  const output = { timezone: "Asia/Seoul", updatedAt: new Date().toISOString(), records: records.slice(0, 365) };
  const temporaryFile = `${HISTORY_FILE}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(output, null, 2), "utf8");
  await fs.rename(temporaryFile, HISTORY_FILE);
  return output.records;
}

module.exports = { readWeatherHistory, saveDailyWeatherRecord };
