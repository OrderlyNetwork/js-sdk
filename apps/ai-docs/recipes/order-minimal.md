---
id: recipe.order-minimal
kind: recipe
packages:
  - "@orderly.network/perp"
summary: Pseudocode outline for placing a minimal order (illustrative)
---

# Recipe: minimal order (outline)

> Illustrative only — always use live types from order entry components and broker rules.

## Goal

Provide a minimal, safe order submission outline for agent guidance.

## Inputs

- Connected wallet/account session context.
- Symbol constraints (tick size, min notional, precision).
- Intended order side/type and target quantity/price.

## Prerequisites

1. Wallet/account session is connected and authenticated.
2. Symbol metadata (tick size, min notional) is available.
3. Integration layer exposes official order submission APIs.

## Steps

1. Ensure account is funded and connected (`orderly_docs_get_workflow` wallet flow).
2. Build order payload from symbol metadata (tick size, min notional).
3. Validate with `Decimal` for price and quantity.
4. Submit via official order APIs exposed by your integration layer.
5. Handle errors: insufficient margin, market closed, post‑only violations — fetch guardrails narrative for recovery text.

## Next tool call

- Use `orderly_docs_get_guardrails` to retrieve safety text for signing, retries, and user-facing error recovery.
- Use `orderly_docs_search` with order/validation keywords if broker-specific narrative steps are required.

## Outputs

- A validated minimal order payload aligned with symbol constraints.
- Submission attempt routed through official integration APIs.
- A deterministic recovery branch selected for common order failures.

## Fast path

1. Confirm connected session and fetch symbol constraints.
2. Build payload with `Decimal` validation for price/quantity.
3. Submit via official API and branch recovery with `orderly_docs_get_guardrails` on failure.

```typescript
// Use Decimal from @orderly.network/utils for amounts
import { Decimal } from "@orderly.network/utils";

const price = new Decimal("30000.5");
const qty = new Decimal("0.01");
// … submit through your broker SDK when wired
```
