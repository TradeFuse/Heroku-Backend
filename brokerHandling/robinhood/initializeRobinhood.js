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

  let _private = {
    username: email,
    password: password,
    grant_type: "password",
    scope: "internal",
    client_id: _clientId,
    expires_in: 86400,
    device_token: _deviceToken,
  };

  const loginRobinhood = async (mfaCode) => {
    let dataIn = {
      username: _private.username,
      password: _private.password,
      grant_type: _private.grant_type,
      scope: _private.scope,
      client_id: _private.client_id,
      expires_in: _private.expires_in,
      device_token: _private.device_token,
    };
    if (mfaCode) {
      dataIn.mfa_code = mfaCode;
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

  const firstResponse = await loginRobinhood();
  const set_mfa_code = async () => {
    await loginRobinhood(mfaCode);
  };
  if (firstResponse && firstResponse.mfa_required) {
    returnObj = await set_mfa_code();
  }
  console.log("firstResponse", firstResponse)
  console.log("returnObj", returnObj);
  /*   var Robinhood = robinhood(credentials(email, password), (err, data) => {
    if (err) {
    } else {
      if (data && data.mfa_required) {
        var mfa_code = mfaCode;

        Robinhood.set_mfa_code(mfa_code, async () => {
          if (Robinhood.auth_token()) {
            propsToChange = {
              linkedBrokerInfo: {
                broker: "robinhood",
                token: Robinhood.auth_token(),
              },
            };
            req.app.set('robinhoodInfo', { propsToChange: propsToChange });

            Robinhood.orders(null, function (err, response, body) {
              if (err) {
                console.error(err);
              } else {
                console.log("orders", body);
                req.app.set('robinhoodInfo', { orders: body });
              }
            });
          } else {
          }
        });
      } else {
      }
    }
  }); */
  return returnObj;
};
