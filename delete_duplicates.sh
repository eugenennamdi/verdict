#!/bin/bash
echo "Deleting duplicate services from OKX Agent Registry..."

onchainos agent update --agent-id 4686 --service '[
  {"operation":"delete","id":"7a3a4cc2-6a64-40d8-b0cd-8df25ceb0223","serviceName":"del","serviceDescription":"del","serviceType":"A2A"},
  {"operation":"delete","id":"77c5cecf-38e3-4fcf-a634-9640232a5778","serviceName":"del","serviceDescription":"del","serviceType":"A2A"},
  {"operation":"delete","id":"400f61ec-af66-437d-9109-bc45216d7b3e","serviceName":"del","serviceDescription":"del","serviceType":"A2A"},
  {"operation":"delete","id":"67115d5b-22c6-484e-b45a-f891dc44fcc4","serviceName":"del","serviceDescription":"del","serviceType":"A2A"},
  {"operation":"delete","id":"70435807-32a7-4179-b616-4c5e09b744ac","serviceName":"del","serviceDescription":"del","serviceType":"A2A"},
  {"operation":"delete","id":"f05eee87-03ca-4f4f-aa35-08eef95badcd","serviceName":"del","serviceDescription":"del","serviceType":"A2A"},
  {"operation":"delete","id":"0dc56f01-fb98-49df-9d2d-df1ec9ff913d","serviceName":"del","serviceDescription":"del","serviceType":"A2A"}
]'

echo "Duplicates deleted! Only the two final A2MCP services remain."
