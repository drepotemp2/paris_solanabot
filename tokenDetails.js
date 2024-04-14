const axios = require("axios");

module.exports = tokenDetails = async (address) => {
  const url = process.env.URL;

  const response = await fetch(`${url}${address}`, {
    "content-type": "application/json",
  });

  const data = await response.json();
  // console.log(data)
  if (data.pairs) {
    return {
      success: true,
      data,
    };
  }

  return {
    success: false,
  };
};
