const robinhood = require("robinhood");

module.exports = async function initializeRobinhood(bodyData) {
  const email = bodyData.data["email"];
  const password = bodyData.data["password"];
  const mfaCode = bodyData.data["mfaCode"];

  const credentials = (email, password) => {
    return {
      username: email,
      password: password,
    };
  };
  let returnObj = {};

  const RobinhoodTry = robinhood(
    credentials(email, password),
    () => {}
  );

  console.log("RobinhoodTry", RobinhoodTry);

  var mfa_code = mfaCode; // set mfa_code here

  const token = RobinhoodTry.set_mfa_code(mfa_code, async () => {
    return RobinhoodTry.auth_token();
  });
console.log("token", token)
  const orders =
    token &&
    RobinhoodTry.orders(null, function (err, response, body) {
      if (err) {
        throw err;
      } else {
        return body;
      }
    });
  propsToChange = {
    linkedBrokerInfo: {
      broker: "robinhood",
      token: token,
      /*                         askforcode: checked,
       */
    },
  };
  returnObj.propsToChange = propsToChange;
  returnObj.orders = orders;

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
            returnObj.propsToChange = propsToChange;

            /*         $(".linkRobinhoodMFAErrorMsg").css({ display: "none" });
              $(".linkRobinhoodMFAErrorMsg").html(""); */
            Robinhood.orders(null, function (err, response, body) {
              if (err) {
                console.error(err);
              } else {
                console.log("orders", body);
                returnObj.orders = body;
              }
            });
          } else {
          }
        });
      } else {
      }
    }
  });
  return returnObj;
};