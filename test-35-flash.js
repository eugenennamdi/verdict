require('dotenv').config({path: '.env.local'});
fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gemini-3.5-flash",
    messages: [{role: "user", content: "Hi"}]
  })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
});
