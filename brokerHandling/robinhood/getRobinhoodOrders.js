let queryString = require("query-string");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const isIterable = require("../../utils/handleIterator");
module.exports = async function getRobinhoodOrders(bodyData, req) {
  console.log(bodyData);
  const _authToken = bodyData.data["token"];
  const _assetClasses = bodyData.data["assetClasses"];

  let allorders = [];
  let isNextExist = true;
  let isNextExistOptions = true;
  let isNextExistOptionsEvents = true;

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
  let optionseventsURL =
    "https://api.robinhood.com/options/events/" + headerOptions;

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
  const loopFunction = async (loopMap) => {
    if (loopMap.asset === "") {
      // bank transfer, ach transfers, ach receieved, wire, transfers, crypto transfers. etc
      while (loopMap.isNextExistVar) {
        const bankResponse = await getRobinhoodO(loopMap.url, loopMap.apiType);
        if (bankResponse) {
          const bankResults = bankResponse.results;
          const bankMapped = bankResults?.map((obj) => ({
            ...obj,
            rhType: loopMap.type,
          }));
          isIterable(bankMapped) && allorders.push(...bankMapped);
          if (
            !bankResponse.next ||
            bankResponse.next === null ||
            bankResponse.next === ""
          ) {
            loopMap.isNextExistVar = false;
          } else {
            loopMap.url = ordersResponse.next;
          }
        } else {
          loopMap.isNextExistVar = false;
        }
      }
    } else {
      // Stock, Options, and Crypto orders
      if (_assetClasses.includes(loopMap.asset)) {
        while (loopMap.isNextExistVar) {
          const ordersResponse = await getRobinhoodO(
            loopMap.url,
            loopMap.apiType
          );
          if (ordersResponse) {
            const ordersResults = ordersResponse.results;
            const ordersMapped = ordersResults?.map((obj) => ({
              ...obj,
              rhType: loopMap.type,
            }));
            isIterable(ordersMapped) && allorders.push(...ordersMapped);
            if (
              !ordersResponse.next ||
              ordersResponse.next === null ||
              ordersResponse.next === ""
            ) {
              loopMap.isNextExistVar = false;
            } else {
              loopMap.url = ordersResponse.next;
            }
          } else {
            loopMap.isNextExistVar = false;
          }
        }
      }
    }
  };
  const loopMapArr = [
    {
      asset: "Stocks",
      url: ordersURL,
      type: "stock",
      isNextExistVar: isNextExist,
      apiType: "api",
    },
    {
      asset: "Options",
      url: optionsURL,
      type: "option",
      isNextExistVar: isNextExistOptions,
      apiType: "api",
    },
    {
      asset: "Options",
      url: optionseventsURL,
      type: "optionevent",
      isNextExistVar: isNextExistOptionsEvents,
      apiType: "api",
    },
    {
      asset: "Crypto",
      url: cryptoURL,
      type: "crypto",
      isNextExistVar: isNextExistcrypto,
      apiType: "nummus",
    },
    {
      asset: "",
      url: bankURL,
      type: "bank transfer",
      isNextExistVar: isNextExistDW,
      apiType: "api",
    },
    {
      asset: "",
      url: withdrawalURL,
      type: "ach",
      isNextExistVar: isNextExistach,
      apiType: "api",
    },
    {
      asset: "",
      url: receivedURL,
      type: "ach received",
      isNextExistVar: isNextExistachreceived,
      apiType: "api",
    },
  ];
  const functionArray = loopMapArr.map(
    async (loopMap) => await loopFunction(loopMap)
  );
  console.log(functionArray);
  const returnOrders = () => {
    return Promise.all(functionArray);
  };
  const orders = returnOrders();

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
  return { allorders: orders };
};
