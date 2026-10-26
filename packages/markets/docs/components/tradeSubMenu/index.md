# tradeSubMenu

Product switcher for the main-nav **Trade** sub menu: a Perps entry with its markets panel, a Prediction entry, and optional host entries. Exports: `TradeSubMenuWidget`, `TradeSubMenu`, `useTradeSubMenuScript`, `PERPS_TRADE_SUB_MENU_KEY`, `PREDICTION_TRADE_SUB_MENU_KEY`, `DEFAULT_TRADE_SUB_MENU_SYMBOL` and the `TradeSubMenuItem` / `TradeSubMenuWidgetProps` types.

## Usage

The SDK does not read the host router, so the host derives the active entry and the Perps symbol from its own route and renders the widget as a component:

```tsx
import { TradeSubMenuWidget } from "@orderly.network/markets";

function TradeSubMenu() {
  const path = usePathWithoutLang(); // host helper, e.g. "/perp/PERP_BTC_USDC"
  const { symbol } = useParams();
  const isPrediction =
    path === "/prediction" || path.startsWith("/prediction/");
  return (
    <TradeSubMenuWidget
      activeKey={isPrediction ? "prediction" : "perps"}
      // `:symbol` on other routes is not a Perps market; round symbols are also ignored by the widget.
      symbol={isPrediction ? undefined : symbol}
    />
  );
}

const mainMenus = [
  {
    name: "Trading",
    href: "/",
    activeHrefs: ["/prediction"],
    customSubMenuRender: () => <TradeSubMenu />,
  },
];
```

## Props

| Prop             | Default             | Behavior                                                                                                                                                      |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeKey`      | `"perps"`           | Controls the highlighted entry. The host updates it when its route changes; clicks only request navigation or run the entry's `onClick`.                      |
| `symbol`         | —                   | Perps symbol of the current page; Prediction round symbols are ignored. Otherwise the remembered symbol (`getStoredPerpSymbol`, read once per mount) is used. |
| `defaultSymbol`  | `"PERP_ETH_USDC"`   | Used when no symbol is passed or remembered.                                                                                                                  |
| `items`          | built-ins           | `(builtins) => items`: insert, reorder, rebrand or remove entries.                                                                                            |
| `onSymbolChange` | route to the market | Overrides navigation for markets picked in the panel.                                                                                                         |
| `className`      | —                   | Extra classes on the root (`oui-tradeSubMenu`); entries carry `oui-tradeSubMenu-item` and `data-active`.                                                      |

## Navigation and features

- Entries navigate through the app provider's `onRouteChange`: Perps requests `perpRoute(symbol)` (`/perp/:symbol`), Prediction requests `predictionRoute()` (`/prediction`, which fills the default round). An entry's `onClick` replaces route navigation.
- Highlighting follows `activeKey`, including for custom entries. The host must update this prop to change the highlighted entry; if omitted, Perps stays highlighted. A pending or cancelled navigation leaves the highlight on the current page.
- The Prediction entry is omitted while `features.prediction` is `false` on `OrderlyAppProvider`.
- Hovering Perps or its panel opens the markets panel; hovering any other entry closes it, even when Perps is highlighted. With no hover override, the panel follows `activeKey === "perps"`; leaving the menu clears the override. Removing the Perps entry removes the panel.
- The widget never writes the remembered symbol; the host's Perps page owns `setStoredPerpSymbol`. Both storage helpers are exported from `@orderly.network/utils`.

## Custom entries

```tsx
<TradeSubMenuWidget
  activeKey={activeKey} // Derived from the host route, including "spot".
  items={(builtins) => [
    {
      key: "spot",
      title: t("extend.spot"),
      activeIcon: <EarnActiveIcon size={20} />,
      inactiveIcon: <EarnInactiveIcon size={20} />,
      route: { href: "/swap", name: "spot" },
    },
    ...builtins,
  ]}
/>
```
