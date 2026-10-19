# Orders page

Exported as `OrdersModule.OrdersPage` from `@orderly.network/portfolio`.

| Prop             | Type             | Default | Behavior                        |
| ---------------- | ---------------- | ------- | ------------------------------- |
| `sharePnLConfig` | `SharePnLConfig` | —       | Passed to the Perps order rows. |

The SDK owns product queries, merged pagination, filtering, Prediction cells and cancellation. TP/SL applies only to Perps. Prediction uses the current signed-in account. Filled Prediction orders include executed IOC orders that ended canceled.

Download exports the loaded rows matching the current product and filters, using actual execution quantities and outcome prices. Load more history through pagination before exporting additional rows.

Prediction is included by default. Set `features={{ prediction: false }}` on `OrderlyAppProvider` to restore the Perps-only page application-wide. This releases automatic Prediction resources without disabling account valuation.
