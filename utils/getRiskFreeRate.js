const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getRiskFreeRate(bodyData, req) {
  let returnObj = {};
  const treasuryURL =
    "https://home.treasury.gov/sites/default/files/interest-rates/yield.xml";
  const getRate = async () => {
    const response = await fetch(treasuryURL, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        Host: "home.treasury.gov",
        Accept: "application/xml",
        "Content-Type": "application/xml",
        "Accept-Encoding": "gzip, deflate",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "OPTIONS, DELETE, POST, GET, PATCH, PUT",
        "Access-Control-Allow-Headers": "*",
      },
    }).catch((err) => {
      return undefined;
    });
    return response; // parses JSON response into native JavaScript objects
  };

  const rateResponse = await getRate();
  returnObj.rate = rateResponse;
  return returnObj;
};
