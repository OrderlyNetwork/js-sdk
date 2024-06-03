import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { OverviewPage } from "@orderly.network/portfolio";
import { NewAppProvider } from "../../../components/newAppProvider.tsx";

const meta = {
  title: "Page/Portfolio/OverviewPage",
  component: OverviewPage,
  decorators: [
    (Story: any) => (
      <NewAppProvider>
        <Story />
      </NewAppProvider>
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
    p: {
      control: {
        type: "number",
        min: 0,
        max: 10,
        step: 1,
      },
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    p: 5,
    // py: 2,
  },
} satisfies Meta<typeof OverviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
