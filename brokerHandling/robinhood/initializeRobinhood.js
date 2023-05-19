const NodeRSA = require("node-rsa");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const key = new NodeRSA();
const key2 = new NodeRSA();

const privatePem = `-----BEGIN RSA PRIVATE KEY-----${process.env.PRIVATE_KEY}-----END RSA PRIVATE KEY-----`;
key.importKey(privatePem, "pkcs1-pem");
key2.importKey(
  `-----BEGIN PUBLIC KEY-----${process.env.PUB_KEY}-----END PUBLIC KEY-----`,
  "pkcs8-public-pem"
);
module.exports = async function initializeRobinhood(bodyData, req) {
  let returnObj = {};
  const email = bodyData.data["email"];
  const passwordPre = bodyData.data["password"];
  const decryptedString = key.decrypt(passwordPre, "utf8");
  const password = decryptedString?.replace(/"/g, "");
  const mfaCode = bodyData.data["mfaCode"];
  const _clientId = "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS";
  const _deviceToken = "ea9fa5c6-01e0-46c9-8430-5b422c99bd16";

  const loginRobinhood = async (mfaCodeIn) => {
    let dataIn = {
      username: email,
      password: password,
      grant_type: "password",
      scope: "internal",
      client_id: _clientId,
      expires_in: 86400,
      device_token: _deviceToken,
    };
    if (mfaCodeIn) {
      dataIn.mfa_code = mfaCodeIn;
    }
    const response = await fetch("https://api.robinhood.com/oauth2/token/", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        Host: "api.robinhood.com",
        Accept: "application/json",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate",
        Referer: "https://robinhood.com/",
        Origin: "https://robinhood.com",
      },
      body: JSON.stringify(dataIn),
    }).catch((err) => {
      return undefined;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  const firstResponse = await loginRobinhood();
  const set_mfa_code = async () => {
    const rhData = await loginRobinhood(mfaCode);
    return rhData;
  };
  if (firstResponse && firstResponse.mfa_required) {
    returnObj = await set_mfa_code();
  }
  console.log("returnObj", returnObj);
  console.log("access token", returnObj.access_token);

  const encryptedCredentials = returnObj?.access_token && key2.encrypt(
    JSON.stringify(returnObj.access_token),
    "base64"
  );

  returnObj.access_token = encryptedCredentials;
  return returnObj;
};
