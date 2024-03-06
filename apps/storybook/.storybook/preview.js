import { withThemeByDataAttribute } from "@storybook/addon-styling";
import "../src/tailwind.css"; // tailwind css

const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // viewport: {
    //   defaultViewport: "mobile2",
    // },
  },
  globalTypes: {
    symbol: {
      description: "Internationalization locale",
      defaultValue: "PERP_ETH_USDC",
      toolbar: {
        icon: "database",
        items: [
          { value: "PERP_ETH_USDC", title: "PERP_ETH_USDC" },
          { value: "PERP_NEAR_USDC", title: "PERP_NEAR_USDC" },
          { value: "PERP_BTC_USDC", title: "PERP_BTC_USDC" },
          { value: "PERP_TIA_USDC", title: "PERP_TIA_USDC" },
          { value: "PERP_AVAX_USDC", title: "PERP_AVAX_USDC" },
          { value: "PERP_WOO_USDC", title: "PERP_WOO_USDC" },
        ],
      },
    },
  },
  decorators: [
    // (Story) => {
    //   return <Story />;
    // },
    withThemeByDataAttribute({
      themes: {
        orderly: "",
        custom: "custom",
      },
      defaultTheme: "orderly",
      attributeName: "data-o-theme",
    }),
  ],
};

export default preview;
