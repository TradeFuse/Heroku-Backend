const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getAssetData(bodyData) {
  const assets = bodyData.assets;
  const options = {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      assets: assets,
      periodUnit: "Day",
      startTime: 1640995200000,
      periodLength: 1,
    }),
  };

  const response = await fetch(
    "https://platform.atom.finance/api/2.0/price/history" +
      "?api_key=" +
      process.env.ATOM_FINANCE_KEY,
    options
  ).catch((err) => {
    throw err;
  });
  return response.json(); // parses JSON response into native JavaScript objects
};
