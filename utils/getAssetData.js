module.exports = async function getAssetData(bodyData) {
  const assets = bodyData.assets;
  const options = {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      assets: assets,
    }),
  };

  const response = await fetch(
    "https://platform.atom.finance/api/2.0/price/snapshot" + "?" + process.env.ATOM_FINANCE_KEY,
    options
  ).catch((err) => {
    throw err;
  });
  return response.json(); // parses JSON response into native JavaScript objects

};
