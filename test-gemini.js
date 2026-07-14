const { OpenAI } = require('openai');
require('dotenv').config({path: '.env.local'});
const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || ''
});
async function run() {
  try {
    const response = await openai.chat.completions.create({
      model: "gemini-3.5-flash",
      messages: [{role: "user", content: "Reply with JSON { \"test\": \"hello\" }"}],
      response_format: { type: 'json_object' }
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (e) {
    console.error("Error code:", e.status);
  }
}
run();
