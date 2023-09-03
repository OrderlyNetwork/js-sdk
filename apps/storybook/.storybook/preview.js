
import '../src/tailwind.css';
import '@orderly.network/components/dist/styles.css'



/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
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
      
        ],
      },
    },
  },
};

export default preview;
