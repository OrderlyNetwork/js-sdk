---
id: workflow.wallet-connect
kind: workflow
packages:
  - "@orderly.network/hooks"
  - "@orderly.network/core"
summary: Connect wallet and establish Orderly session
---

# Workflow: wallet connect

## Goal

Connect a wallet and establish a stable Orderly session without repeated signing loops.

## Inputs

- Broker/environment configuration (env, network, broker identity).
- Wallet connector selection and runtime availability.
- User intent to connect/sign in.

## Prerequisites

1. Host app has broker/network configuration ready.
2. A wallet connector is configured (EVM or Solana).
3. User has access to the target chain/account.

## Steps

1. Initialize broker / network config per host app (`OrderlyAppProvider` or equivalent).
2. Request wallet connection through the configured connector (EVM or Solana).
3. After address is available, create or restore Orderly account state (sign‑in flow as documented in trading package).
4. Handle rejection: show user message; do not loop sign requests without backoff.

## Failure recovery

- **Wrong network**: prompt chain switch; re‑validate provider.
- **User rejected**: stop; require explicit user retry.
- **RPC timeout**: surface retry with jitter; check public RPC health.

## Next tool call

- Use `orderly_docs_get_package_surface` for `@orderly.network/hooks` to validate available wallet/account entry points.
- Use `orderly_docs_get_guardrails` to retrieve signing constraints and retry posture.
- Use `orderly_docs_search` with wallet/sign-in intent terms when flow details are unclear.

## Outputs

- Wallet connected with a resolved user address.
- Orderly account/session state created or restored.
- Retry/error handling path selected for rejection/network failures.

## Fast path

1. Initialize provider config and connect wallet.
2. Create/restore Orderly session immediately after address resolution.
3. On failure, branch via `orderly_docs_get_guardrails` and stop blind retries.

## Related tools

- `orderly_docs_get_package_surface` for `@orderly.network/hooks`
- `orderly_docs_get_guardrails` for signing constraints
- `orderly_docs_search` for narrative recovery guidance across wallet/account flows
