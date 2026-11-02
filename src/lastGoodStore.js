const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const STORE_FILE = path.join(DATA_DIR, "last-good-weather.json");

async function readLastGoodWeather() {
  try {
    const content = await fs.readFile(STORE_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) return null;
    throw error;
  }
}

async function saveLastGoodWeather(record) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temporaryFile = `${STORE_FILE}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(record, null, 2), "utf8");
  await fs.rename(temporaryFile, STORE_FILE);
}

module.exports = { readLastGoodWeather, saveLastGoodWeather };
