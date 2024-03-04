import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dashboard } from "@orderly.network/referral";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Page/Referral",
  component: Dashboard,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  //   tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
//   decorators: [
//     (Story) => (
//       <OrderlyAppProvider brokerId="orderly" networkId="testnet">
//         <Story />
//       </OrderlyAppProvider>
//     ),
//   ],
};

type Story = StoryObj<typeof Dashboard>;
// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  render: (args, { globals }) => {
    return <div>
        <span className="orderly-text-red">ASDADS</span>
        <Dashboard />
    </div>;
  },
  args: {
  },
};
