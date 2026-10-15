# Binary fee rollout dependencies

## Product authority

The canonical product requirements at reference commit `8760150` define maker 0 /
taker 300 bps as the account default. The frontend consumes the account's actual
rates without a default fallback. Both roles use a shared Binary coefficient cap,
configured independently of PERP and fixed at 300 bps inclusive. No legacy
150 bps cap is applied by the frontend.

The Binary funding buffer has been confirmed and is exported as
`BINARY_ORDER_FROZEN_BUFFER` from the SDK root. It is independent of PERP and is
shared by required frozen, MAX, balance checks and batch submission estimates.
Risk/Writer must use the same value. The cap's highest effective fee rate
(`cap * 0.99`), minimum-fill upward rounding, price improvement and shared funding
fixtures still require backend integration verification before production rollout.

## Conflicting reference materials

Backend owners must align these materials with the canonical HTML PRD before
deployment. The frontend change does not modify their configuration or databases.

| Reference material under `.reference/binary-options/`                        | Stale contract                                     | Owner follow-up                                                                                                |
| ---------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `task.md`, including TASK-19 and TASK-29                                     | Default 0/6 bps, 150 bps cap, shared ISO buffer    | Align tasks and acceptance with 0/300 bps and the Binary-only buffer                                           |
| `docs/tech/release_note/1_before_hotrelease/setting/orderly-fee-service.txt` | `broker.binary.fee.rate.max=0.015`                 | Deploy the confirmed 300 bps cap and matching validation; the old cap rejects the new default                  |
| Release SQL and fee/TradingConfig designs                                    | Defaults and migration notes still reference 6 bps | Confirm new/default and existing-account migration without overwriting valid overrides or historical fee facts |
| Risk/Writer designs                                                          | Existing shared buffer baseline                    | Deploy the confirmed Binary-only buffer and verify matching precision, rounding and funding fixtures           |

## Remaining release gates

- Deploy the confirmed Binary cap and SDK buffer consistently across backend
  consumers; verify minimum-fill rounding and price-improvement coverage.
- Reconcile BUY/SELL net opening risk, pending allocations, replacement orders,
  partial fills, reversals and IOC cancellation with Risk/Writer. Pure closing
  orders must retain zero additional funding, and the fee estimate must not be
  added a second time to the required frozen amount.
- Builders must import `BINARY_ORDER_FROZEN_BUFFER` from the SDK root entry;
  do not introduce an API field, duplicate a literal or add a per-host override.
- Publish the compatible SDK/frontend first, allow a transition period, switch
  backend parameters in a maintenance window, then retire old SDK versions.
- Backend and release owners must define handling for existing orders/positions,
  mixed SDK versions and rollback before the switch. Fee and funding unit tests
  alone do not establish end-to-end coverage or deployment readiness.
