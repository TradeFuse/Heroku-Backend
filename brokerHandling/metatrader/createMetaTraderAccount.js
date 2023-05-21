let MetaApi;
import("metaapi.cloud-sdk")
  .then((module) => {
    MetaApi = module;
    console.log(MetaApi);
  })
  .catch((error) => {
    // Handle the error if the import fails
    console.error("Failed to import dfgdfgdfg:", error);
  });
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const token = "...";
const api = new MetaApi(token);

export const createMetaTraderAccount = async (bodyData, req) => {
  let returnObj = {};
  const positionid = bodyData.data["id"];
  const _authToken = bodyData.data["token"];
  const bearerString = `Bearer ` + _authToken;
  /*   try {
    const account = await api.metatraderAccountApi.createAccount({
      name: "Trading account #1",
      type: "cloud",
      login: "1234567",
      platform: "mt4",
      // password can be investor password for read-only access
      password: "qwerty",
      server: "ICMarketsSC-Demo",
      magic: 123456,
      keywords: ["Raw Trading Ltd"],
      quoteStreamingIntervalInSeconds: 2.5, // set to 0 to receive quote per tick
      reliability: "high", // set this field to 'high' value if you want to increase uptime of your account (recommended for production environments)
    });
  } catch (err) {
    // process errors
    if (err.details) {
      // returned if the server file for the specified server name has not been found
      // recommended to check the server name or create the account using a provisioning profile
      if (err.details === "E_SRV_NOT_FOUND") {
        console.error(err);
        // returned if the server has failed to connect to the broker using your credentials
        // recommended to check your login and password
      } else if (err.details === "E_AUTH") {
        console.log(err);
        // returned if the server has failed to detect the broker settings
        // recommended to try again later or create the account using a provisioning profile
      } else if (err.details === "E_SERVER_TIMEZONE") {
        console.log(err);
      }
    }
  } */
  return returnObj;
};
