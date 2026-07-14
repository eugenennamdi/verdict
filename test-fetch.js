const { OpenAI } = require('openai');
require('dotenv').config({path: '.env.local'});
const originalFetch = global.fetch;
global.fetch = async (...args) => {
  const req = args[0] instanceof Request ? args[0] : new Request(args[0], args[1]);
  console.log("HEADERS:", Object.fromEntries(req.headers.entries()));
  return originalFetch(...args);
};
const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || ''
});
async function run() {
  try {
    await openai.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [{role: "user", content: "hello"}]
    });
  } catch(e) {
  }
}
run();
