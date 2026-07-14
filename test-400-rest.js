require('dotenv').config({path: '.env.local'});
const text = "A".repeat(5000); // Simulate large content
fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gemini-pro-latest",
    messages: [{role: "user", content: `Reply with json { "test": true } \n ${text}`}],
    response_format: { type: "json_object" }
  })
}).then(async r => {
  console.log("Status:", r.status);
  console.log("Body:", await r.text());
});
