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
                console.log("orders");
                console.log(body);
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
