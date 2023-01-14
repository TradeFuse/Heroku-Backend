const jsdom = require("jsdom");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getRiskFreeRate(bodyData, req) {
  let returnObj = {};
  const treasuryURL =
    "https://home.treasury.gov/sites/default/files/interest-rates/yield.xml";
  const getRate = async () => {
    const response = await fetch(treasuryURL, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        Host: "home.treasury.gov",
        Accept: "application/xml",
        "Content-Type": "application/xml",
        "Accept-Encoding": "gzip, deflate",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "OPTIONS, DELETE, POST, GET, PATCH, PUT",
        "Access-Control-Allow-Headers": "*",
      },
    }).catch((err) => {
      return undefined;
    });
    return response; // parses JSON response into native JavaScript objects
  };
  const response = await getRate();
  console.log(response);

  const xml = await response.text();
  console.log(xml);

  const dom = new jsdom.JSDOM(xml);
  const bc4MonthValue =
    dom.window.document.getElementsByTagName("BC_4MONTH")[0].textContent;
  returnObj.rate = bc4MonthValue;
  return returnObj;
};
