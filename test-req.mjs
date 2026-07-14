const req = new Request("https://example.com", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hello: "world" })
});

const clonedHeaders = new Headers(req.headers);
clonedHeaders.set("Accept", "application/json, text/event-stream");

const cloned = new Request(req.url, {
  method: req.method,
  headers: clonedHeaders,
  body: req.clone().body,
  duplex: 'half'
});

console.log(cloned.headers.get("Accept"));
cloned.json().then(console.log);
