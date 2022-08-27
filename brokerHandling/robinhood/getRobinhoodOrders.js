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
  let wireURL = "https://api.robinhood.com/wire/transfers" + headerOptions;
  let cardURL =
    "https://minerva.robinhood.com/history/transactions/" + headerOptions;
  let withdrawalURL = "https://api.robinhood.com/ach/relationships/";

  let ordersURL = "https://api.robinhood.com/orders/" + headerOptions;
  let optionsURL = "https://api.robinhood.com/options/orders/" + headerOptions;
  let cryptoURL = "https://nummus.robinhood.com/orders/" + headerOptions;

  let instrumentsURL = "https://api.robinhood.com/instruments/";

  // -----------------
  const bearerString = `Bearer ` + _authToken;
  console.log(bearerString);
  const getRobinhoodO = async (url, id) => {
    let hostURL = "";
    if (id === 0) {
      hostURL = "api.robinhood.com";
    } else if (id === 1) {
      hostURL = "nummus.robinhood.com";
    } else if (id === 2) {
      hostURL = "minerva.robinhood.com";
    }
    const response = await fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        Host: hostURL,
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
    while (isNextExist) {
      const ordersResponse = await getRobinhoodO(ordersURL, 0);
      if (ordersResponse) {
        allorders.push(...ordersResponse.results);
        if (
          !ordersResponse.next ||
          ordersResponse.next === null ||
          ordersResponse.next === ""
        ) {
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
      const optionsResponse = await getRobinhoodO(optionsURL, 0);
      if (optionsResponse) {
        allorders.push(...optionsResponse.results);
        if (
          !optionsResponse.next ||
          optionsResponse.next === null ||
          optionsResponse.next === ""
        ) {
          isNextExistOptions = false;
        } else {
          optionsURL = optionsResponse.next;
        }
      }
    }
  }

  // Get crypto orders
  const cryptoResponse = await getRobinhoodO(cryptoURL, 1);
  allorders.push(cryptoResponse);

  // Get bank transfers
  while (isNextExistDW) {
    const bankResponse = await getRobinhoodO(bankURL, 0);
    if (bankResponse) {
      allorders.push(...bankResponse.results);
      if (
        !bankResponse.next ||
        bankResponse.next === null ||
        bankResponse.next === ""
      ) {
        isNextExistDW = false;
      } else {
        bankURL = bankResponse.next;
      }
    }
  }

  // Get card transfers
  const cardResponse = await getRobinhoodO(cardURL, 2);
  allorders.push(cardResponse);

  // Get ach
  const achResponse = await getRobinhoodO(withdrawalURL, 0);
  allorders.push(achResponse);
  /*   while (isNextExistDW) {
    const bankResponse = await getRobinhoodO(bankURL);
    if (bankResponse) {
      allorders.push(...bankResponse.results);
      if (
        !bankResponse.next ||
        bankResponse.next === null ||
        bankResponse.next === ""
      ) {
        isNextExistDW = false;
      } else {
        bankURL = bankResponse.next;
      }
    }
  } */

  let i = 0;
  let instruments = [];

  return { allorders: allorders, instruments: instruments };
};
