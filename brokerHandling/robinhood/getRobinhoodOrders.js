let queryString = require("query-string");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getRobinhoodOrders(bodyData, req) {
  console.log(bodyData);
  const _authToken = bodyData.data["token"];
  const _assetClasses = bodyData.data["assetClasses"];

  let allorders = [];
  let isNextExist = true;
  let isNextExistOptions = true;
  let isNextExistDW = true;
  let isNextExistcrypto = true;
  let isNextExistInstruments = true;
  let isNextExistcard = true;
  let isNextExistach = true;
  let isNextExistachreceived = true;

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

  let withdrawalURL = "https://api.robinhood.com/ach/relationships/";

  let ordersURL = "https://api.robinhood.com/orders/" + headerOptions;
  let optionsURL = "https://api.robinhood.com/options/orders/" + headerOptions;
  let cryptoURL = "https://nummus.robinhood.com/orders/" + headerOptions;

  //let instrumentsURL = "https://api.robinhood.com/instruments/";
  let instrumentsURL =
    "https://api.robinhood.com/instruments/?cursor=cD1lNzM0YzI5OS0wZjE3LTRhZDAtODRmOS03ZmJiOTg3NmRlYzE%3D";
  // -----------------
  const bearerString = `Bearer ` + _authToken;
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
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        return undefined;
      });
    return response; // parses JSON response into native JavaScript objects
  };

  // Get regular orders
  if (_assetClasses.includes("Stocks")) {
    while (isNextExist) {
      const ordersResponse = await getRobinhoodO(ordersURL, "api");
      if (ordersResponse) {
        const ordersResults = ordersResponse.results;
        const ordersMapped = ordersResults?.map((obj) => ({
          ...obj,
          rhType: "stock",
        }));
        allorders.push(...ordersMapped);
        if (
          !ordersResponse.next ||
          ordersResponse.next === null ||
          ordersResponse.next === ""
        ) {
          isNextExist = false;
        } else {
          ordersURL = ordersResponse.next;
        }
      } else {
        isNextExist = false;
      }
    }
  }
  // Get options orders
  if (_assetClasses.includes("Options")) {
    while (isNextExistOptions) {
      const optionsResponse = await getRobinhoodO(optionsURL, "api");
      if (optionsResponse) {
        const optionsResults = optionsResponse.results;
        const optionsMapped = optionsResults?.map((obj) => ({
          ...obj,
          rhType: "option",
        }));
        allorders.push(...optionsMapped);
        if (
          !optionsResponse.next ||
          optionsResponse.next === null ||
          optionsResponse.next === ""
        ) {
          isNextExistOptions = false;
        } else {
          optionsURL = optionsResponse.next;
        }
      } else {
        isNextExistOptions = false;
      }
    }
  }

  // Get crypto orders
  if (_assetClasses.includes("Crypto")) {
    while (isNextExistcrypto) {
      const cryptoResponse = await getRobinhoodO(cryptoURL, "nummus");
      if (cryptoResponse) {
        const cryptoResults = cryptoResponse.results;
        const cryptoMapped = cryptoResults?.map((obj) => ({
          ...obj,
          rhType: "crypto",
        }));
        allorders.push(...cryptoMapped);
        if (
          !cryptoResponse.next ||
          cryptoResponse.next === null ||
          cryptoResponse.next === ""
        ) {
          isNextExistcrypto = false;
        } else {
          cryptoURL = cryptoResponse.next;
        }
      } else {
        isNextExistcrypto = false;
      }
    }
  }

  // Get bank transfers
  while (isNextExistDW) {
    const bankResponse = await getRobinhoodO(bankURL, "api");
    if (bankResponse) {
      const bankResults = bankResponse.results;
      const bankMapped = bankResults?.map((obj) => ({
        ...obj,
        rhType: "bank transfer",
      }));
      allorders.push(...bankMapped);
      if (
        !bankResponse.next ||
        bankResponse.next === null ||
        bankResponse.next === ""
      ) {
        isNextExistDW = false;
      } else {
        bankURL = bankResponse.next;
      }
    } else {
      isNextExistDW = false;
    }
  }

  // Get card transactions
  // by default, exclude this
  /*   while (isNextExistcard) {
    const cardResponse = await getRobinhoodO(cardURL, "minerva");
    if (isNextExistcard) {
      const cardResults = cardResponse.results;
      const cardMapped = cardResults.map((obj) => ({
        ...obj,
        rhType: "card transaction",
      }));
      allorders.push(...cardMapped);
      if (
        !cardResponse.next ||
        cardResponse.next === null ||
        cardResponse.next === ""
      ) {
        isNextExistcard = false;
      } else {
        cardURL = cardResponse.next;
      }
    }
  } */

  // Get card transfers
  /*   const cardTransferResponse = await getRobinhoodO(cardTransferURL, "minerva");
  allorders.push(cardTransferResponse); */

  // Get ach
  while (isNextExistach) {
    const achResponse = await getRobinhoodO(withdrawalURL, "api");
    if (isNextExistach) {
      const achResults = achResponse.results;
      const achMapped = achResults?.map((obj) => ({ ...obj, rhType: "ach" }));
      allorders.push(...achMapped);
      if (
        !achResponse.next ||
        achResponse.next === null ||
        achResponse.next === ""
      ) {
        isNextExistach = false;
      } else {
        withdrawalURL = achResponse.next;
      }
    } else {
      isNextExistach = false;
    }
  }

  // Get ach received
  while (isNextExistachreceived) {
    const receivedResponse = await getRobinhoodO(receivedURL, "api");
    if (isNextExistachreceived) {
      const receivedResults = receivedResponse.results;
      const receivedMapped = receivedResults?.map((obj) => ({
        ...obj,
        rhType: "ach received",
      }));
      allorders.push(...receivedMapped);
      if (
        !receivedResponse.next ||
        receivedResponse.next === null ||
        receivedResponse.next === ""
      ) {
        isNextExistachreceived = false;
      } else {
        receivedURL = receivedResponse.next;
      }
    } else {
      isNextExistachreceived = false;
    }
  }
  // Get wire transfers
  /*   const wireResponse = await getRobinhoodO(wireURL, "api");
  allorders.push(wireResponse); */
  let i = 0;
  let instruments = [];
  /* 
  while (isNextExistInstruments) {
    const instrumentResponse = await getRobinhoodO(instrumentsURL, "api");
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
    if (i === 20) {
      instruments.push(instrumentResponse);
      break;
    }
    i++;
  } */

  return { allorders: allorders };
};
