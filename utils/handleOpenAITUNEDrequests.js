const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async function handleOpenAITUNEDrequests(bodyData) {
  let message = "";
  try {
    const completion = await openai.createChatCompletion({
      model: "ft:gpt-3.5-turbo-0125:tradefuse:masteraimessage1:9ArVNiyr",
      messages: [{ role: "user", content: bodyData.data["message"] }],
    });
    message = completion.data.choices[0].message;
  } catch (error) {
    return error;
  }
  return message;
};
