import type { Meta, StoryObj } from "@storybook/react";

import toast, { Toaster } from "react-hot-toast";
import { OrderlyProvider } from "../provider";

const meta: Meta<typeof Toaster> = {
  component: Toaster,
  title: "Base/Wallet",
  decorators: [
    (Story) => {
      return (
        <Web3OnboardProvider web3Onboard={web3Onboard}>
          <Story />
        </Web3OnboardProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => {
    return (
      <div className={"flex gap-3"}>
        <Button
          onClick={() => {
            connect();
          }}
        >
          Connect Wallet
        </Button>
        <SvgImage
          svg={wallet?.icon ?? ""}
          backgroundColor={"transparent"}
          rounded
        />
      </div>
    );
  },
};
