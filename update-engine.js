const fs = require('fs');
let code = fs.readFileSync('src/lib/engine.ts', 'utf8');

code = code.replace(
  /const openai = new OpenAI\(\{[\s\S]*?\}\);/,
  `const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || ''
});`
);

code = code.replace(/const modelName = 'z-ai\/glm-5.2';/g, "const modelName = 'gemini-3.5-flash';");
code = code.replace(/const modelName = 'meta\/llama-3.1-70b-instruct';/g, "const modelName = 'gemini-3.5-flash';");

fs.writeFileSync('src/lib/engine.ts', code);
