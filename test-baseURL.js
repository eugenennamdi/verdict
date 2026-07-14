const { OpenAI } = require('openai');
require('dotenv').config({path: '.env.local'});
const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/",
  apiKey: process.env.GEMINI_API_KEY || ''
});
async function run() {
  try {
    const response = await openai.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [{role: "user", content: "Reply with JSON { \"test\": \"hello\" }"}],
    });
    console.log(`Success:`, response.choices[0].message.content);
  } catch (e) {
    console.error(`Error:`, e.status, e.message);
  }
}
run();
