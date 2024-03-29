const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getcryptoinstrumentsRobinhood(bodyData, req) {
  let returnObj = {};
  const instrumentURL = 'https://nummus.robinhood.com/currency_pairs/';

  const getCryptoInstrumentRobinhood = async () => {
    const response = await fetch(instrumentURL, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        Host: "nummus.robinhood.com",
        Accept: "application/json",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate",
        Referer: "https://robinhood.com/",
        Origin: "https://robinhood.com",
      },
    }).catch((err) => {
      return undefined;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  const instrumentResponse = await getCryptoInstrumentRobinhood();
  returnObj.instrument = instrumentResponse;
  return returnObj;
};
