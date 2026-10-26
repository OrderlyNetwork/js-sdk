# Positions page

Exported as `PositionsModule.PositionsPage` from `@orderly.network/portfolio`. Existing `PositionsProps`, including sharing, price calculation and symbol callbacks, continue to configure Perps positions.

| Prop                            | Type                                     | Default | Behavior                                       |
| ------------------------------- | ---------------------------------------- | ------- | ---------------------------------------------- |
| `positionProductContent`        | `(perpsContent: ReactNode) => ReactNode` | —       | Overrides the built-in Positions panel.        |
| `positionHistoryProductContent` | `(perpsContent: ReactNode) => ReactNode` | —       | Overrides the built-in Position history panel. |

Both product switches start on Perps. Current Prediction positions follow the Perps account scope: a main account can select all accounts (the default), the main account, or a child account. Rows are grouped by account, and the account selection is preserved across product switches. A signed-in child account only manages its own positions. Product switches omit position counts.

Current-account positions use the existing live stream. Child positions come from `/v1/client/aggregate/positions`, with the default mount, focus and reconnect revalidation and no additional polling. Market and limit close popovers lazily load the owning account's complete positions, Binary pending orders and Client Info fees, then refresh and recheck them before sending a reduce-only ISOLATED order. Requests retain the main signer and use the owning account header; the global login is unchanged. Accepted close requests refresh the scoped resources and aggregate positions; limit acceptance does not remove an unfilled holding.

Prediction Position history continues to use the signed-in account and displays the current-account hint. Orders and Liquidation retain their existing account scopes; this integration adds no child order management or bulk close actions.

Set `features={{ prediction: false }}` on `OrderlyAppProvider` for Perps-only content. Custom callbacks take precedence for their tab, including when automatic Prediction integration is disabled. Nullish callback results retain the original Perps table. Liquidation remains Perps-only.
