const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function getLast3YearsSP500Data() {
  let returnObj = {};
  const API_KEY = process.env.REACT_APP_ALPHAVANTAGEKEY; // Replace with your actual Alpha Vantage API key
  const SYMBOL = "SPY"; // Using SPY, an ETF that tracks the S&P 500, as the symbol

  async function fetchSP500Data(startDate, endDate) {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${SYMBOL}&outputsize=full&apikey=${API_KEY}`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const dailyData = data["Time Series (Daily)"];

      // Filter the entries by your date range
      const filteredData = Object.entries(dailyData)
        .filter(([date]) => date >= startDate && date <= endDate)
        .map(([date, value]) => ({
          date,
          close: value["4. close"],
        }));
      return filteredData;
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  // Calculate the start date as 3 years before today
  const today = new Date();
  const startDate = new Date(new Date().setFullYear(today.getFullYear() - 3))
    .toISOString()
    .split("T")[0];
  const endDate = today.toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format

  returnObj = await fetchSP500Data(startDate, endDate);
  return returnObj;
};
