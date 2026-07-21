import json
log_path = "/Users/apple/.gemini/antigravity/brain/a9e51042-5158-4d37-b4ed-6bea4cbee585/.system_generated/logs/transcript.jsonl"
with open(log_path, "r") as f:
    lines = f.readlines()

print("SEARCHING FOR TRUNCATION OR SOLUTION:")
for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        content = data.get("content", "")
        if data.get("type") == "USER_INPUT" and ("trunc" in content.lower() or "solution" in content.lower()):
            print(f"--- STEP {data.get('step_index')} ---")
            print(content[:1000])
    except:
        pass
