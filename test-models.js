require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY
});

async function run() {
  try {
    const models = await openai.models.list();
    const glmModels = models.data.filter(m => m.id.toLowerCase().includes('glm'));
    console.log("GLM Models found:", glmModels.map(m => m.id));
  } catch (error) {
    console.error("Error:", error.message);
  }
}
run();
