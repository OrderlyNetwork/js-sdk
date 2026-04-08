---
id: workflow.wallet-connect
kind: workflow
packages:
  - "@orderly.network/hooks"
  - "@orderly.network/core"
summary: Connect wallet and establish Orderly session
---

# Workflow: wallet connect

## Steps

1. Initialize broker / network config per host app (`OrderlyAppProvider` or equivalent).
2. Request wallet connection through the configured connector (EVM or Solana).
3. After address is available, create or restore Orderly account state (sign‑in flow as documented in trading package).
4. Handle rejection: show user message; do not loop sign requests without backoff.

## Failure recovery

- **Wrong network**: prompt chain switch; re‑validate provider.
- **User rejected**: stop; require explicit user retry.
- **RPC timeout**: surface retry with jitter; check public RPC health.

## Related tools

- `orderly_get_package_surface` for `@orderly.network/hooks`
- `orderly_get_guardrails` for signing constraints
