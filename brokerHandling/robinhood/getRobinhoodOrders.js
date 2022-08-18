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
  let ordersURL = "https://api.robinhood.com/orders/" + headerOptions;
  let optionsURL = "https://api.robinhood.com/options/orders/" + headerOptions;
  let instrumentsURL = "https://api.robinhood.com/instruments/";

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

  let bankURL = "https://api.robinhood.com/ach/transfers/" + headerOptions;

  // Get regular orders
  if (_assetClasses.includes("Stocks")) {
    while (isNextExist) {
      const ordersResponse = await getRobinhoodO(ordersURL);
      if (ordersResponse && isIterable(ordersResponse)) {
        allorders.push(...ordersResponse.results);
        if (!ordersResponse.next) {
          isNextExist = false;
        } else {
          ordersURL = ordersResponse.next;
        }
      }
    }
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
  /*   while (isNextExistInstruments) {
    i++;
  } */
  const instrumentsResponse = await getRobinhoodO(instrumentsURL);
  console.log(instrumentsResponse);
  /*   if (instrumentsResponse) {
    instruments.push(...instrumentsResponse.results);
    if (!instrumentsResponse.next) {
      isNextExistInstruments = false;
    } else {
      instrumentsURL = instrumentsResponse.next;
    }
  } */
  console.log(instruments);
  return { allorders: allorders, instruments: instruments };
};
