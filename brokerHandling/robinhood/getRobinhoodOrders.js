let queryString = require("query-string");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getRobinhoodOrders(bodyData, req) {
  const _authToken = bodyData.data["token"];

  let allorders = [];
  let isNextExist = true;

  // INITAL HEADER OPTIONS
  let options = {
    "updated_at[gte]": "2017-08-25",
  };
  const headerOptions = "?" + queryString.stringify(options);
  let nextURL = "https://api.robinhood.com/orders/" + headerOptions;
  // -----------------

  const getRobinhoodO = async (url) => {
    const response = await fetch(url, {
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
    }).catch((err) => {
      throw err;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  while (isNextExist) {
    const ordersResponse = await getRobinhoodO(nextURL);
    if (ordersResponse) {
      allorders.push(ordersResponse.results);
      if (!ordersResponse.next) {
        isNextExist = false;
      } else {
        nextURL = ordersResponse.next;
      }
    }
  }

  return allorders;
};
