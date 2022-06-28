const robinhood = require("robinhood");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function initializeRobinhood(bodyData, req) {

  const email = bodyData.data["email"];
  const password = bodyData.data["password"];
  const mfaCode = bodyData.data["mfaCode"];

  const credentials = (email, password) => {
    return {
      username: email,
      password: password,
    };
  };

  const step1Robinhood = async () => {
    const dataIn = {
      action: "initializeRobinhood",
      data: {
        username: email,
        password: password,
        mfa_code: mfaCode
      },
    };
    const response = await fetch("https://api.robinhood.com/oauth2/token/", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        Host: "api.robinhood.com",
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate',
        Referer: 'https://robinhood.com/',
        Origin: 'https://robinhood.com',
      },
      body: JSON.stringify(dataIn),
    }).catch((err) => {
      throw err;
    });
    return response.json(); // parses JSON response into native JavaScript objects
  };

  const mfaData = await step1Robinhood();
  console.log("mfaData", mfaData)
  var Robinhood = robinhood(credentials(email, password), (err, data) => {
    if (err) {
    } else {
      if (data && data.mfa_required) {
        var mfa_code = mfaCode; // set mfa_code here

        Robinhood.set_mfa_code(mfa_code, async () => {
          if (Robinhood.auth_token()) {
            propsToChange = {
              linkedBrokerInfo: {
                broker: "robinhood",
                token: Robinhood.auth_token(),
                /*                         askforcode: checked,
                 */
              },
            };
            req.app.set('robinhoodInfo', { propsToChange: propsToChange });

            /*         $(".linkRobinhoodMFAErrorMsg").css({ display: "none" });
              $(".linkRobinhoodMFAErrorMsg").html(""); */
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
  });
  return {}
};
