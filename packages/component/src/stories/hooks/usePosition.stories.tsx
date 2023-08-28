import { MemoryConfigStore } from "@orderly/core";
import { OrderlyProvider } from "../../provider";
import React, { FC, useMemo } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { API } from "@orderly/types";

import { usePosition } from "@orderly/hooks";

const PositionHookDemo: FC<{
  data: API.Position[];
}> = (props) => {
  const children = useMemo(() => {
    return props.data.map((position) => {
      return (
        <div>
          <div className="flex gap-2">
            <button className="border rounded px-2 border-slate-500">
              Limit Colose
            </button>
            <button className="border rounded px-2 border-slate-500">
              Market Close
            </button>
          </div>
        </div>
      );
    });
  }, [props.data]);
  return (
    <div className="text-black">
      <div className="flex gap-2">
        <button className="border rounded px-2 border-slate-500">
          Market Close All
        </button>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/usePositionStream",
  component: PositionHookDemo,
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider configStore={new MemoryConfigStore()}>
          <Story />
        </OrderlyProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof PositionHookDemo>;

export const Default: Story = {
  render: () => {
    return <PositionHookDemo data={[]} />;
  },
};
