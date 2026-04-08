---
id: recipe.order-minimal
kind: recipe
packages:
  - "@orderly.network/perp"
summary: Pseudocode outline for placing a minimal order (illustrative)
---

# Recipe: minimal order (outline)

> Illustrative only — always use live types from order entry components and broker rules.

1. Ensure account is funded and connected (`orderly_get_workflow` wallet flow).
2. Build order payload from symbol metadata (tick size, min notional).
3. Validate with `Decimal` for price and quantity.
4. Submit via official order APIs exposed by your integration layer.
5. Handle errors: insufficient margin, market closed, post‑only violations — fetch guardrails narrative for recovery text.

```typescript
// Use Decimal from @orderly.network/utils for amounts
import { Decimal } from "@orderly.network/utils";

const price = new Decimal("30000.5");
const qty = new Decimal("0.01");
// … submit through your broker SDK when wired
```
