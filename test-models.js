require('dotenv').config({path: '.env.local'});
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
.then(r => r.json())
.then(d => {
  const models = d.models.map(m => m.name.replace('models/', ''));
  console.log("All Models:", models);
  console.log("Includes 3.5?", models.some(m => m.includes("3.5")));
});
