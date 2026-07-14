require('dotenv').config({path: '.env.local'});
const { OpenAI } = require('openai');
const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY
});
openai.chat.completions.create({
  model: "gemini-3.5-flash",
  messages: [{role: "user", content: "Hi. Reply with a json object: {\"hello\":\"world\"}"}]
}).then(r => console.log(r.choices[0].message.content)).catch(e => {
  console.log("Error:", e.message);
  console.log("Status:", e.status);
});
