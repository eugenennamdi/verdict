const { OpenAI } = require('openai');
require('dotenv').config({path: '.env.local'});
const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || ''
});
async function testModel(modelName) {
  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{role: "user", content: "Reply with JSON { \"test\": \"hello\" }"}],
      response_format: { type: 'json_object' }
    });
    console.log(`Success ${modelName}:`, response.choices[0].message.content);
  } catch (e) {
    console.error(`Error ${modelName}:`, e.status, e.message);
  }
}
async function run() {
  await testModel("gemini-2.5-flash");
  await testModel("gemini-2.0-flash");
  await testModel("gemini-1.5-pro");
}
run();
