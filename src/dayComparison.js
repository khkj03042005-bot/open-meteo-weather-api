function compareLatestDays(records) {
  const sorted = [...(Array.isArray(records) ? records : [])]
    .filter(item => item && item.dateKST && Number.isFinite(Number(item.temperature)))
    .sort((a, b) => b.dateKST.localeCompare(a.dateKST));

  if (sorted.length < 2 || sorted[0].dateKST === sorted[1].dateKST) return null;

  const latest = sorted[0];
  const previous = sorted[1];
  if (latest.temperatureUnit !== previous.temperatureUnit) {
    return { latest, previous, delta: null, comparable: false };
  }
  return {
    latest,
    previous,
    delta: Number((Number(latest.temperature) - Number(previous.temperature)).toFixed(1)),
    comparable: true
  };
}

module.exports = { compareLatestDays };
