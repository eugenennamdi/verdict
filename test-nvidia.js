require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY
});

async function run() {
  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [{ role: 'user', content: "Return { \"hello\": \"world\" }" }],
      response_format: { type: 'json_object' }
    });
    console.log("Success:", aiResponse.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
run();
