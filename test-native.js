const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({path: '.env.local'});
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'hello',
    });
    console.log(response.text);
  } catch(e) {
    console.error(e);
  }
}
run();
