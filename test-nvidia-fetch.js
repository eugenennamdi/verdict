require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'z-ai/glm-5.2',
        messages: [{ role: 'user', content: "Hello" }],
        max_tokens: 10
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
run();
