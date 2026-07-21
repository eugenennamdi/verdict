import json
import glob
import os

logs_dir = "/Users/apple/.gemini/antigravity/brain/a9e51042-5158-4d37-b4ed-6bea4cbee585/.system_generated/logs"
transcript_file = os.path.join(logs_dir, "transcript.jsonl")

messages = []
with open(transcript_file, "r") as f:
    for line in f:
        line = line.strip()
        if not line: continue
        try:
            data = json.loads(line)
            content = data.get("content", "")
            if content and isinstance(content, str):
                messages.append((data.get("step_index"), data.get("source"), content))
        except Exception:
            pass

for i, (idx, source, content) in enumerate(messages):
    lower = content.lower()
    if "too long" in lower or "ellipsis" in lower or "cut off" in lower or "shortened" in lower or "..." in lower or "format" in lower or "raw" in lower or "json" in lower:
        # print only if it mentions onchainos or payment or output
        if "onchainos" in lower or "payment" in lower or "output" in lower:
            pass # this might be too noisy, let's search for specific okx cli flags or "solution"

            print(f"[{messages[j][0]}] {messages[j][1]}: {messages[j][2][:200]}...")
        print("="*40)
