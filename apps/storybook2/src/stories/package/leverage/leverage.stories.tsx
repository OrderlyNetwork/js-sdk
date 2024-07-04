import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { LeverageEditor,LeverageWidgetId } from '@orderly.network/ui-leverage';
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { Button, modal } from "@orderly.network/ui";

const meta = {
  title: "Package/ui-leverage/LeverageEditor",
  component: LeverageEditor,
  // subcomponents: {
  //     Assets: OverviewModule.AssetWidget,
  //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  // },
  decorators: [
    (Story) => (
      <ConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
          <Story />
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    // p: {
    //     control: {
    //         type: "number",
    //         min: 0,
    //         max: 10,
    //         step: 1,
    //     },
    // },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
  },
} satisfies Meta<typeof LeverageEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Defaut: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: "380px" }}>
        <Story />
      </div>
    ),
  ],
};


export const CommandStyle: Story = {
  render: () => {
    return <Button onClick={()=>{
      modal.show(LeverageWidgetId, { currentLeverage: 5 });
    }}>Adjust leverage</Button>
  },
}