const robinhood = require("robinhood");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function initializeRobinhood(bodyData, req) {
  let returnObj = {};
  const email = bodyData.data["email"];
  const password = bodyData.data["password"];
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
      throw err;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  var firstResponse = (async function f() {
    await loginRobinhood();
    return f;
  })();
  console.log(firstResponse)
  const set_mfa_code = async () => {
    const rhData = await loginRobinhood(mfaCode);
    return rhData;
  };
  if (firstResponse && firstResponse.mfa_required) {
    returnObj = await set_mfa_code();
  }

  return returnObj;
};
