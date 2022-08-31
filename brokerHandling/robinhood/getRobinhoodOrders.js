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
  let receivedURL =
    "https://api.robinhood.com/ach/received/transfers/" + headerOptions;

  let wireURL = "https://api.robinhood.com/wire/transfers" + headerOptions;
  let cardURL =
    "https://minerva.robinhood.com/history/transactions" + headerOptions;

  let cardTransferURL =
    "https://minerva.robinhood.com/history/deposits" + headerOptions;
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
    if (id === "api") {
      hostURL = "api.robinhood.com";
    } else if (id === "nummus") {
      hostURL = "nummus.robinhood.com";
    } else if (id === "minerva") {
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
      const ordersResponse = await getRobinhoodO(ordersURL, "api");
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
      const optionsResponse = await getRobinhoodO(optionsURL, "api");
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
  const cryptoResponse = await getRobinhoodO(cryptoURL, "nummus");
  allorders.push(cryptoResponse);

  // Get bank transfers
  while (isNextExistDW) {
    const bankResponse = await getRobinhoodO(bankURL, "api");
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

  // Get card tranactions
  const cardResponse = await getRobinhoodO(cardURL, "minerva");
  allorders.push(cardResponse);

  // Get card transfers
/*   const cardTransferResponse = await getRobinhoodO(cardTransferURL, "minerva");
  allorders.push(cardTransferResponse); */

  // Get ach
  const achResponse = await getRobinhoodO(withdrawalURL, "api");
  allorders.push(achResponse);

  // Get ach received
  const receivedResponse = await getRobinhoodO(receivedURL, "api");
  allorders.push(receivedResponse);

  // Get wire transfers
/*   const wireResponse = await getRobinhoodO(wireURL, "api");
  allorders.push(wireResponse); */
  let i = 0;
  while (isNextExistInstruments) {
    const instrumentResponse = await getRobinhoodO(instrumentsURL);
    if (instrumentResponse) {
      instruments.push(...instrumentResponse.results);
      if (
        !instrumentResponse.next ||
        instrumentResponse.next === null ||
        instrumentResponse.next === ""
      ) {
        isNextExistInstruments = false;
      } else {
        instrumentsURL = instrumentResponse.next;
      }
    }
    if (i === 10) {
      break
    }
    i++
  } 

  let instruments = [];

  return { allorders: allorders, instruments: instruments };
};
