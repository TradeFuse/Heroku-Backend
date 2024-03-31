var jsonpack = require("jsonpack/main");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
module.exports = async function putUserData(data, proddev) {
  var compressedData = jsonpack.pack(data.data);

  function escapeSpecialCharacters(str) {
    if (!str || typeof str !== "string") {
      return str;
    }

    var map = {
      "\b": "\\\\b",
      "\f": "\\\\f",
      "\n": "\\\\n",
      "\r": "\\\\r",
      "\t": "\\\\t",
      "\v": "\\\\v",
      /*         '\'': '\\\\\'', // do not use prettier otherwise these will go away, '\'': '\\\\\''
        '\"': '\\\\"',  // do not use prettier otherwise these will go away, '\"': '\\\\"' */
      "\\": "\\\\",
    };

    return str.replace(/[\b\f\n\r\t\v\\]/g, function (m) {
      return map[m];
    });
  }
  const escapeLiterals = escapeSpecialCharacters(compressedData);
  let newData = {
    data: {
      userId: data.userId,
      data: escapeLiterals, // compress the data
    },
  };

  const url =
    proddev === "prod"
      ? "https://opkt3gy2of.execute-api.us-west-1.amazonaws.com/prod/put-entries-multi"
      : "https://c5jfnnmixj.execute-api.us-west-1.amazonaws.com/default/put-entries-multi";

  if (!data || !data?.data || data?.data === "" || !data?.userId) {
  } else {
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    }).catch((err) => {
      throw err;
    });
  }
};
