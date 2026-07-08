require('dotenv').config({ path: '.env.local' });

async function poll() {
  console.log("Starting polling for z-ai/glm-5.2...");
  while (true) {
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
          max_tokens: 5
        })
      });
      
      const text = await res.text();
      if (res.status === 200 && !text.includes('DEGRADED')) {
        console.log("MODEL IS BACK ONLINE! Status:", res.status);
        console.log("Response:", text);
        process.exit(0);
      } else {
        console.log(`[${new Date().toISOString()}] Still degraded. Response: ${text.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    // Wait 10 seconds between checks to respond quickly in this session
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
poll();
