let queryString = require("query-string");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
}

module.exports = async function getRobinhoodOrders(bodyData, req) {
  console.log(bodyData);
  const _authToken = bodyData.data["token"];
  const _assetClasses = bodyData.data["assetClasses"];

  let allorders = [];
  let isNextExist = true;
  let isNextExistOptions = true;
  let isNextExistDW = true;
  let isNextExistInstruments = true;

  // INITAL HEADER OPTIONS
  let options = {
    "updated_at[gte]": "2017-08-25",
  };
  const headerOptions = "?" + queryString.stringify(options);
  let bankURL = "https://api.robinhood.com/ach/transfers/" + headerOptions;
  let ordersURL = "https://api.robinhood.com/orders/" + headerOptions;
  let optionsURL = "https://api.robinhood.com/options/orders/" + headerOptions;
  let instrumentsURL = "https://api.robinhood.com/instruments/";

  // -----------------
  const bearerString = `Bearer ` + _authToken;
  console.log(bearerString)
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
        Authorization: bearerString,
      },
    }).catch((err) => {
      throw err;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  // Get regular orders
  if (_assetClasses.includes("Stocks")) {
    //console.log(ordersURL)

    const ordersResponse = await getRobinhoodO(ordersURL);
    allorders.push(...ordersResponse.results);

    //console.log(ordersResponse)
/*     while (isNextExist) {
      const ordersResponse = await getRobinhoodO(ordersURL);
      if (ordersResponse && isIterable(ordersResponse)) {
        allorders.push(...ordersResponse.results);
        if (!ordersResponse.next) {
          isNextExist = false;
        } else {
          ordersURL = ordersResponse.next;
        }
      }
    } */
  }
  // Get options orders
  if (_assetClasses.includes("Options")) {
    while (isNextExistOptions) {
      const optionsResponse = await getRobinhoodO(optionsURL);
      if (optionsResponse && isIterable(optionsResponse)) {
        allorders.push(...optionsResponse.results);
        if (!optionsResponse.next) {
          isNextExistOptions = false;
        } else {
          optionsURL = optionsResponse.next;
        }
      }
    }
  }
  // Get bank transfers
  while (isNextExistDW) {
    const bankResponse = await getRobinhoodO(bankURL);
    if (bankResponse && isIterable(bankResponse)) {
      allorders.push(...bankResponse.results);
      if (!bankResponse.next) {
        isNextExistDW = false;
      } else {
        bankURL = bankResponse.next;
      }
    }
  }

  // Get bank transfers
  let i = 0;
  let instruments = [];

  return { allorders: allorders, instruments: instruments };
};
