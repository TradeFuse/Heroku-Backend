let queryString = require("query-string");
const NodeRSA = require("node-rsa");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const isIterable = require("../../utils/handleIterator.cjs");
const key = new NodeRSA();
const privatePem = `-----BEGIN RSA PRIVATE KEY-----${process.env.PRIVATE_KEY}-----END RSA PRIVATE KEY-----`;
key.importKey(privatePem, "pkcs1-pem");
module.exports = async function getRobinhoodOrders(bodyData, req) {
  const _authTokenPre = bodyData.data["token"];
  const decryptedString = key.decrypt(_authTokenPre, "utf8");
  const _authToken = decryptedString?.replace(/"/g, "");
  const _assetClasses = bodyData.data["assetClasses"];

  let allorders = [];

  // INITAL HEADER OPTIONS
  let options = {
    "updated_at[gte]": "2017-08-25",
  };
  const headerOptions = "?" + queryString.stringify(options);
  let bankURL = "https://api.robinhood.com/ach/transfers/" + headerOptions;
  let receivedURL =
    "https://api.robinhood.com/ach/received/transfers/" + headerOptions;

  let wireURL = "https://api.robinhood.com/wire/transfers" + headerOptions;
  let transfersURL =
    "https://bonfire.robinhood.com/paymenthub/transfers/" + headerOptions;
  let transfers2URL =
    "https://cashier.robinhood.com/ach/transfers/" + headerOptions;
  let transfers3URL =
    "https://cashier.robinhood.com/received_ach/transfers/" + headerOptions;
  let cryptotransfersURL =
    "https://bonfire.robinhood.com/crypto/transfers/history/" + headerOptions;
  let cardURL =
    "https://minerva.robinhood.com/history/transactions" + headerOptions;

  let withdrawalURL = "https://api.robinhood.com/ach/relationships/";

  let ordersURL = "https://api.robinhood.com/orders/" + headerOptions;
  let optionsURL = "https://api.robinhood.com/options/orders/" + headerOptions;
  let optionseventsURL =
    "https://api.robinhood.com/options/events/" + headerOptions;

  let cryptoURL = "https://nummus.robinhood.com/orders/" + headerOptions;
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
    } else if (id === "bonfire") {
      hostURL = "bonfire.robinhood.com";
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
    let url = loopMap.url;
    let isNextExist = true;
    if (loopMap.asset === "") {
      // bank transfer, ach transfers, ach receieved, wire, transfers, crypto transfers. etc
      while (isNextExist) {
        const bankResponse = await getRobinhoodO(url, loopMap.apiType);
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
            isNextExist = false;
          } else {
            url = bankResponse.next;
          }
        } else {
          isNextExist = false;
        }
      }
    } else {
      // Stock, Options, and Crypto orders
      if (_assetClasses.includes(loopMap.asset)) {
        while (isNextExist) {
          const ordersResponse = await getRobinhoodO(url, loopMap.apiType);
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
              isNextExist = false;
            } else {
              url = ordersResponse.next;
            }
          } else {
            isNextExist = false;
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
      apiType: "api",
    },
    {
      asset: "Options",
      url: optionsURL,
      type: "option",
      apiType: "api",
    },
    {
      asset: "Options",
      url: optionseventsURL,
      type: "optionevent",
      apiType: "api",
    },
    {
      asset: "Crypto",
      url: cryptoURL,
      type: "crypto",
      apiType: "nummus",
    },
    {
      asset: "",
      url: bankURL,
      type: "bank transfer",
      apiType: "api",
    },
    {
      asset: "",
      url: transfersURL,
      type: "transfers",
      apiType: "bonfire",
    },
  ];
  const functionArray = loopMapArr.map(
    async (loopMap) => await loopFunction(loopMap)
  );
  await Promise.all(functionArray);

  return { allorders: allorders };
};
