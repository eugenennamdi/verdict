#!/bin/bash
onchainos agent update --agent-id 4686 \
  --name "Verdict" \
  --description "An autonomous growth auditor that strips away AI positivity bias to deliver YC-grade startup teardowns. Built for founders to harden their go-to-market positioning, and designed for VCs and accelerators to automate deal-flow screening at scale." \
  --service "$(cat services.json)"
