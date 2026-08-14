# npm Dependency Security Audit Remediation Report

## Basic Information

- Package name: `orderly-js-sdk`
- Audit command: `pnpm audit`
- Report date: 2026-08-11

## Audit Results

The current `pnpm audit` reports 19 vulnerabilities: 5 high, 13 moderate, and 1 low. The affected modules are `bigint-buffer`, `image-size`, `nanoid`, `svelte`, `esbuild`, `joi`, `uuid`, `elliptic`, and `@hono/node-server`. No current advisories are reported for Axios, Ethers, or `ws`.

Affected vulnerability packages:

- `image-size`
- `nanoid`
- `bigint-buffer`
- `svelte`
- `esbuild`
- `joi`
- `uuid`
- `elliptic`
- `@hono/node-server`

## Remediation

Overrides with no identifiable runtime path were removed for `aptos>form-data`, `crypto-es@<2.1.0`, and `axios@<1.0.0`. The reachable Axios path was fixed by replacing the root override with a direct `axios@^1.19.0` dependency in `@orderly.network/ui-transfer`. Direct Ethers minimum versions were raised from `^6.16.0` to `^6.17.0`. The two precise `ws` overrides, both pinned to `8.21.2`, were retained. Unused Web3 Onboard WalletConnect/Bitget integrations and the unused Bitget dependency were removed from Storybook and the wallet connector.

Removing the `ws` override entirely during lockfile validation re-resolved multiple `ws@8.13.0` through `8.20.1` versions and triggered `GHSA-96hv-2xvq-fx4p`. These paths come from older Viem, WalletConnect/Reown, Solana, and other transitive dependencies and cannot be eliminated by upgrading Ethers alone, so the precise overrides remain in place.

Dependency changes:

- Added `axios@^1.19.0` to `@orderly.network/ui-transfer`.
- Upgraded `ethers` from `^6.16.0` to `^6.17.0` in `@orderly.network/core`, `@orderly.network/default-solana-adapter`, `@orderly.network/ui-transfer`, and `@orderly.network/web3-provider-ethers`.
- Removed the Axios overrides; updated the `ws` override to `8.21.2` and added the `viem>ws` parent-dependency constraint.

## Current Overrides

The current `package.json` retains only the following two `ws` overrides, both pinned exactly to `8.21.2`:

| Override                        | Reason for retention                                                                                                                                                      | Vulnerability addressed                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `ws@>=8.0.0 <8.21.0` → `8.21.2` | Raises transitive `ws` packages in the vulnerable 8.x range to a patched version. The first patched 8.x release for this advisory is `8.21.0`; the project pins `8.21.2`. | `GHSA-96hv-2xvq-fx4p` / `CVE-2026-48779` (`ws` memory-exhaustion DoS from tiny fragments and data chunks) |
| `viem>ws` → `8.21.2`            | Constrains nested `ws` packages under `viem`, ensuring that different Viem versions and their `isows` paths do not resolve an older `ws`.                                 | Same: `GHSA-96hv-2xvq-fx4p` / `CVE-2026-48779`                                                            |

These overrides address the `ws` advisory only; they do not fix `bigint-buffer`, which is documented separately as an unreachable transitive dependency path. The lockfile's `ws@6.2.6` and `ws@7.5.13` versions are already above the patched versions for their respective branches and are outside the 8.x override range.

## Related Commits

- [`c478edf7ce`](https://gitlab.com/orderlynetwork/orderly-fe/orderly-web/-/commit/c478edf7ce887c34bba9725e99febbc2edb744b3): `fix(security): remediate vulnerabilities in development dependencies`
- [`5510443e06`](https://gitlab.com/orderlynetwork/orderly-fe/orderly-web/-/commit/5510443e060e856367be266af31bf8ec3a48de5a): `fix(security): remediate vulnerabilities in wallet integrations`
- [`0332961ae1`](https://gitlab.com/orderlynetwork/orderly-fe/orderly-web/-/commit/0332961ae15a5044e8ead29d2749caf2e3835990): `fix(security): address remaining actionable npm audit findings`

## Validation

- `pnpm audit --json`: 19 vulnerabilities (5 high, 13 moderate, 1 low).
- `pnpm audit --prod --audit-level=high`: the non-zero exit is expected; it reports 5 high findings (`bigint-buffer` 1, `image-size` 2, `nanoid` 2).
- `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm build`, the Storybook build, the wallet-connector build, and `git diff --check` were recorded as passing in the remediation commits.

## Unreachable Dependency Paths / Accepted Risk

- `bigint-buffer` (`GHSA-3gc7-fjrx-p6mg` / `CVE-2025-3194`): currently appears only in the LayerZero/Solana transitive dependency chain, with no identifiable product runtime path in the code. Re-audit reachability if the related chain is upgraded or enters a product runtime.
- `GHSA-fjxv-7rqg-78g4`, `GHSA-hmw2-7cc7-3qxx` (`form-data`): limited to the currently unidentifiable Aptos execution path; re-audit if Aptos or the related LayerZero path is enabled.
- `GHSA-mpj8-q39x-wq5h` (`crypto-es`): declared only through the `bnc-sdk` type dependency chain of `@web3-onboard/core`; no runtime path was identified in the compiled output. Reassess if runtime `bnc-sdk` loading is restored.
- `GHSA-jr5f-v2jv-69x6`, `GHSA-pmwg-cvhr-8vh7`, `GHSA-pf86-5x62-jrwf` (Axios 0.x): no identifiable product runtime path remains in the Binance transitive chain; the reachable scan-client path is fixed by `axios@^1.19.0`.

## Notes

- The current `package.json` overrides retain only `ws@>=8.0.0 <8.21.0` and `viem>ws`, both pinned to `8.21.2`.
- Audit results can change as the npm advisory database is updated. The vulnerability package list reflects the `pnpm audit` result checked on 2026-08-11.
