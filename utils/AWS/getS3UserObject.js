var jsonpack = require("jsonpack/main");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
module.exports = async function getUserData(data, proddev) {
  const request = await fetch(
    proddev === "prod"
      ? "https://opkt3gy2of.execute-api.us-west-1.amazonaws.com/prod/get-entries"
      : "https://c5jfnnmixj.execute-api.us-west-1.amazonaws.com/default/get-entries",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
      }),
    }
  );
  let returnedData = await request.json();

  // then unpack
  var unpackedData = !returnedData.data
    ? undefined
    : typeof returnedData.data === "object"
    ? jsonpack.unpack(jsonpack.pack(returnedData.data)) // for users who created an account before jsonpack was implemented
    : jsonpack.unpack(returnedData.data);

  let newData = {
    data: unpackedData, // decompress the data
    input: returnedData.input,
    message: returnedData.message,
    picData: returnedData.picData,
  };
  return newData;
};
