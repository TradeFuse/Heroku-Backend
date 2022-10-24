const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getOptionPositionRobinhood(bodyData, req) {
  let returnObj = {};
  const positionid = bodyData.data["id"];
  const _authToken = bodyData.data["token"];
  const bearerString = `Bearer ` + _authToken;

  const getOptionPositionRobinhood = async () => {
    const response = await fetch(
      `https://api.robinhood.com/options/positions/${positionid}/`,
      {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        headers: {
          Host: "api.robinhood.com",
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate",
          Referer: "https://robinhood.com/",
          Origin: "https://robinhood.com",
          Authorization: bearerString,
        },
      }
    ).catch((err) => {
      return undefined;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  const optionpositionResponse = await getOptionPositionRobinhood();
  returnObj.position = optionpositionResponse;
  return returnObj;
};
