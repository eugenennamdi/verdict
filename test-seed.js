require('dotenv').config({path: '.env.local'});
const { OpenAI } = require('openai');
const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY
});
openai.chat.completions.create({
  model: "gemini-pro-latest",
  messages: [{role: "user", content: "Reply with json { \"test\": true }"}],
  response_format: { type: "json_object" },
  seed: 42
}).then(console.log).catch(e => {
  console.log("Error:", e.message);
});
