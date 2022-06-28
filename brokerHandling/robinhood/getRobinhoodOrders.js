const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getRobinhoodOrders(bodyData, req) {
  let returnObj = {};
  const _clientId = "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS";
  const _deviceToken = "ea9fa5c6-01e0-46c9-8430-5b422c99bd16";
  const _authToken = bodyData.data["token"];

  const getRobinhoodO = async () => {
    let dataIn = {
      grant_type: "password",
      scope: "internal",
      client_id: _clientId,
      expires_in: 86400,
      device_token: _deviceToken,
      auth_token: _authToken,
    };

    const response = await fetch("https://api.robinhood.com/orders/", {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        Host: "api.robinhood.com",
        Accept: "application/json",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate",
        Referer: "https://robinhood.com/",
        Origin: "https://robinhood.com",
      },
      body: JSON.stringify(dataIn),
    }).catch((err) => {
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
