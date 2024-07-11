import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import {
  toast, Toaster
} from "@orderly.network/ui";

const meta = {
  title: "Base/toast",
  component: Toaster,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const toaster:  Story = {
  render: (args) => {
    return (
      <>
        <div className="oui-flex oui-flex-col oui-gap-2">
        <button onClick={(e) => {
          toast.success(" success success  success success");
        }}>
          success
        </button>
        <button onClick={(e) => {
          toast.error("error error error error");
        }}>
          error 
        </button>
        <button onClick={(e) => {
          toast.loading("loading loading loading loading");
        }}>
          loading 
        </button>
      </div>
        <Toaster/>
      </>
    );
  },
};


// box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.36);

