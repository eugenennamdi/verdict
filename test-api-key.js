require('dotenv').config({path: '.env.local'});
console.log("Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log("Base URL:", "https://generativelanguage.googleapis.com/v1beta/openai/");
