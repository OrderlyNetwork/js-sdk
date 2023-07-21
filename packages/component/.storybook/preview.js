/** @type { import('@storybook/react').Preview } */

import '../src/tailwind.css'; // tailwind css

const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // viewport:{
    //   defaultViewport: 'largeMobile'
    // }
  },
};

export default preview;
