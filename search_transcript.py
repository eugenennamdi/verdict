import json

log_path = "/Users/apple/.gemini/antigravity/brain/a9e51042-5158-4d37-b4ed-6bea4cbee585/.system_generated/logs/transcript.jsonl"
with open(log_path, "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        content = data.get("content", "")
        if "truncat" in content.lower() and "hermes" in content.lower():
            pass # this is the current one
        elif "truncat" in content.lower() or "authorization_header" in content.lower() or "eyjh" in content.lower():
            if len(content) < 5000:
                print(f"Step {data.get('step_index')} [{data.get('source')}]: {content[:500]}")
    except Exception as e:
        pass
