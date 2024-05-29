import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import { MainNav,} from '@orderly.network/react';
import { ExtensionPosition, ExtensionPositionEnum, ExtensionSlot, OrderlyAppProvider } from '@orderly.network/ui';
import {} from '@orderly.network/portfolio';


const meta = {
    title: 'Widget/Custom',
    component: MainNav,
    decorators: [
      (Story) => (
        <OrderlyAppProvider>
          <Story />
        </OrderlyAppProvider>
      ),
    ],
    // parameters: {
    //   // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    //   layout: 'centered',
    // },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    // tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
    //   backgroundColor: { control: 'color' },

    },
    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {

      // py: 2,

     },
  } satisfies Meta<typeof MainNav>;

  export default meta;
  type Story = StoryObj<typeof meta>;

  export const Default: Story = {
render: (args) => {
  return <ExtensionSlot position={ExtensionPositionEnum.PortfolioLayout} {...args} />;
},
  };
