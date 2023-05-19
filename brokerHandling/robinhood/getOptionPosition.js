const NodeRSA = require("node-rsa");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const key = new NodeRSA();
const privatePem = `-----BEGIN RSA PRIVATE KEY-----${process.env.REACT_APP_PRIVATE_KEY}-----END RSA PRIVATE KEY-----`;
key.importKey(privatePem, "pkcs1-pem");
module.exports = async function getOptionPositionRobinhood(bodyData, req) {
  let returnObj = {};
  const positionid = bodyData.data["id"];
  const _authTokenPre = bodyData.data["token"];
  const decryptedString = key.decrypt(_authTokenPre, "utf8");
  const _authToken = JSON.parse(decryptedString);
  const bearerString = `Bearer ` + _authToken;

  const getOptionPositionsRobinhood = async () => {
    const response = await fetch(
      `https://api.robinhood.com/options/positions/${positionid}/`,
      {
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
      }
    ).catch((err) => {
      return undefined;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  const optionpositionResponse = await getOptionPositionsRobinhood();
  returnObj.position = optionpositionResponse;
  return returnObj;
};
