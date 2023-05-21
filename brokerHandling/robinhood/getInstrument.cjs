const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getinstrumentsRobinhood(bodyData, req) {
  let returnObj = {};
  const instrumentURL = bodyData.data["url"];

  const getInstrumentRobinhood = async () => {
    const response = await fetch(instrumentURL, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        Host: "api.robinhood.com",
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

  const instrumentResponse = await getInstrumentRobinhood();
  returnObj.instrument = instrumentResponse;
  return returnObj;
};
