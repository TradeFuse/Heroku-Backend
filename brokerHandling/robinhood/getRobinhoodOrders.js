const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getRobinhoodOrders(bodyData, req) {
  let returnObj = {};
  const _authToken = bodyData.data["token"];

  const getRobinhoodO = async () => {
    let options = {
      updated_at: "2017-08-25",
    };
    const headerOptions = queryString.stringify(options);
    const response = await fetch(
      "https://api.robinhood.com/orders/" + headerOptions,
      {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        headers: {
          Host: "api.robinhood.com",
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate",
          Referer: "https://robinhood.com/",
          Origin: "https://robinhood.com",
          Authorization: "Bearer " + _authToken,
        },
      }
    ).catch((err) => {
      throw err;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  const ordersResponse = await getRobinhoodO();
  if (ordersResponse) {
    returnObj = ordersResponse;
  }

  return returnObj;
};
