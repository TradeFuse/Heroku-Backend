const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getoptioninstrumentsRobinhood(bodyData, req) {
  let returnObj = {};
  const instrumentid = bodyData.data["id"];

  const getOptionInstrumentRobinhood = async () => {
    const response = await fetch(
      `https://api.robinhood.com/options/instruments/${instrumentid}/`,
      {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        headers: {
          Host: "api.robinhood.com",
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate",
          Referer: "https://robinhood.com/",
          Origin: "https://robinhood.com",
        },
      }
    ).catch((err) => {
      return undefined;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  const optioninstrumentResponse = await getOptionInstrumentRobinhood();
  returnObj.instrument = optioninstrumentResponse;
  return returnObj;
};
