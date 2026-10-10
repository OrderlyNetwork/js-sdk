# Prediction core refactor validation

## Resource comparison

The counts below are per basic-account consumer that is logged in with no pending settlements. They represent enabled resources and polling timers, not measured live HTTP requests; SWR caching, deduplication, focus revalidation, and network retries all affect the actual request count.

| Scenario or resource                                 | Before refactor                   | After refactor                                                           |
| ---------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| Default order history resource                       | 1 enabled                         | 0 enabled                                                                |
| Default settlement history resource                  | 1 enabled                         | 0 enabled                                                                |
| Default history polling timer                        | 1, 60s                            | 0                                                                        |
| Pending settlement positions                         | 5s polling                        | 5s polling; drops to zero once confirmed complete with no display demand |
| History display of completed settlements             | 60s polling                       | 60s polling, kept only while displayed                                   |
| Last consumer unmounts                               | polling released                  | polling released, 0 timers                                               |
| The two paginated queries of the shared orders panel | both enabled                      | only the current product enabled; both when showing a mixed view         |
| Trade submission initialization of the account panel | full trading hooks initialized    | only account cancel, edit, and estimate capabilities initialized         |
| Perps TP/SL queries bundled with the base account    | initialized by the positions hook | reads the public positions store directly, no bundled queries            |
| Full open-orders resource                            | auto-pagination                   | auto-pagination, independent of display pagination                       |

When history needs to be displayed, mount the corresponding widget or explicitly enable the relevant option. Multiple consumers share the account cache and settlement scheduling; tests verify the lifecycle of the per-account scheduling and do not treat consumer callback counts as real HTTP deduplication counts.

Order cache registration is held per consumer. Disabling or unmounting one consumer does not remove a key that other consumers still need; after the last consumer leaves, Prediction resources release the registration. Existing Perps usage that never set load options keeps the original cache-resident behavior.

## Check scope

- Loading and settlement: history off by default, independent toggles, position expiry, position disappearance with delayed settlement records, multiple consumers, stopping tracking, remounting, account switching, logout, and full open-order pagination.
- Trading: unified status projection, cancellation after partial fill, price coordinates, funding and sellable quantity, immutable fields and quantity limits on order edit, disabled protections, and late-response isolation.
- UI: one-tap amount legacy format migration, invalid drafts not saved, bidirectional amount alignment, the 1–3 rows and two-decimal constraints, missing fees, and mode switching; the existing chart geometry, expiry clipping, and stable y-axis tests keep running.
- Public declarations: consumption examples importing from the package root entry; rejection of the legacy `includeHistory` option; build artifact checks for internal hooks, `ReturnType`, and source path leaks.

## Validation results

| Check                                          | Result                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Prediction package tests                       | 166 passed                                                                     |
| Storybook targeted integration tests           | 18 files, 118 passed                                                           |
| hooks order registry and order stream tests    | 2 files, 20 passed                                                             |
| hooks / ui-orders / prediction builds          | ESM, CJS, and declaration builds pass; UI package CSS build passes             |
| Public declaration structure check             | no internal trading hooks, `ReturnType`, or source path references             |
| Full prediction package lint                   | 0 errors, 15 pre-existing warnings; `--max-warnings=0` makes the command fail  |
| Full TypeScript check, prediction / ui-orders  | both fail; only the ethers TS2595 is reported                                  |
| Package root entry consumption example compile | fails; same ethers TS2595, the consumption example itself has no type errors   |
| Full TypeScript check, hooks                   | 129 pre-existing errors; identical item-for-item to HEAD diagnostics, none new |
| `git diff --check`                             | pass                                                                           |

The TypeScript blocker comes from the current core declarations referencing `ethers/src.ts/utils`, which leads the compiler to keep checking the ethers source `providers/ws.ts`; the error is `'WebSocket' can only be imported by using a default import`. This round did not modify that dependency or mask errors by filtering output. The hooks baseline check used HEAD sources in a temporary directory with the same dependency installation; when comparing diagnostics, only directory and line-number differences were removed.

```sh
pnpm --filter @orderly.network/prediction test
pnpm --filter @orderly.network/hooks test --runInBand src/provider/dataCenter/orderKeyRegistry.test.ts src/orderly/useOrderStream/useOrderStream.test.tsx
pnpm --filter @orderly.network/hooks run build:tsup
pnpm --filter @orderly.network/ui-orders build
pnpm --filter @orderly.network/prediction build
pnpm --filter @orderly.network/prediction lint
pnpm exec tsc --noEmit -p packages/prediction/tsconfig.build.json
pnpm exec tsc --noEmit -p packages/ui-orders/tsconfig.build.json
pnpm exec tsc --noEmit -p packages/hooks/tsconfig.build.json
pnpm --filter @orderly.network/storybook exec tsc -p type-tests/tsconfig.prediction.json
```

The Storybook targeted integration tests run from the `apps/storybook` directory:

```sh
pnpm exec vitest run --config vitest.unit.config.ts \
  src/playground/components/prediction*.test.tsx \
  src/playground/components/binary*.test.* \
  src/playground/components/orderlyProvider/predictionAccountData.test.tsx \
  src/playground/components/orderlyProvider/binaryInfoObserver.test.tsx \
  src/playground/pages/portfolio/orders
```

The automated checks above do not replace full functional acceptance before release. Full type checking and strict lint have not all passed; handle the pre-existing check issues above before completing release acceptance.
