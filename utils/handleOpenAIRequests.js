const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async function handleOpenAIRequest(bodyData) {
  let message = "";
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: bodyData.data["message"] }],
    });
    message = completion.data.choices[0].message;
  } catch (error) {
    return error;
  }
  return message;
};
