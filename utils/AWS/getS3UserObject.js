var jsonpack = require("jsonpack/main");

module.exports = async function getUserData(data) {
  const request = await fetch(
    "https://opkt3gy2of.execute-api.us-west-1.amazonaws.com/prod/get-entries",
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

// PRODUCTION ENVIRONMENT
/*
const getUserData = async (data) => {
  const request = await fetch(
    "https://opkt3gy2of.execute-api.us-west-1.amazonaws.com/prod/new-serverside",
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
  const preReturn = await request();
  return preReturn.json();
}; */
