onchainos agent update --agent-id 4686 \
  --service '[
    {
      "operation": "create",
      "serviceName": "Startup Growth Audit",
      "serviceDescription": "Single startup landing page teardown and evaluation.",
      "serviceType": "A2MCP",
      "fee": "0.5",
      "endpoint": "https://tryverdict.xyz/api/evaluate-mcp"
    },
    {
      "operation": "create",
      "serviceName": "Bulk Portfolio Screener",
      "serviceDescription": "Automated bulk deal-flow screening and due diligence.",
      "serviceType": "A2MCP",
      "fee": "10.0",
      "endpoint": "https://tryverdict.xyz/api/bulk-evaluate-mcp"
    }
  ]'
