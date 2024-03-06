import { withThemeByDataAttribute } from "@storybook/addon-styling";
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';

import "../src/tailwind.css"; // tailwind css


const customViewports = {
  "iphone5 SE": {
    "name": "iPhone 5 320",
    "styles": {
      "height": "568px",
      "width": "320px"
    },
    "type": "mobile"
  },
  "iphone6 PRO": {
    "name": "SM 375",
    "styles": {
      "height": "667px",
      "width": "375px"
    },
    "type": "mobile"
  },
  "iphone6p PRO MAX": {
    "name": "MD 480",
    "styles": {
      "height": "853px",
      "width": "480px"
    },
    "type": "mobile"
  },
  "ipad": {
    "name": "LG 768",
    "styles": {
      "height": "1024px",
      "width": "768px"
    },
    "type": "tablet"
  },
  "ipad12p 1024": {
    "name": "XL 1024",
    "styles": {
      "height": "1366px",
      "width": "1024px"
    },
    "type": "tablet"
  },
  "1440": {
    "name": "2XL 1440",
    "styles": {
      "height": "1366px",
      "width": "1440px"
    },
    "type": "tablet"
  },
};

const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewport: {
      viewports: {
        // ...INITIAL_VIEWPORTS,
        // ...MINIMAL_VIEWPORTS,
        ...customViewports,
      },
      defaultViewport: 'iphone14promax',
    },
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
    (Story) => {
      console.log("INITIAL_VIEWPORTS", INITIAL_VIEWPORTS, "MINIMAL_VIEWPORTS", MINIMAL_VIEWPORTS);
      return <Story />;
    },
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
