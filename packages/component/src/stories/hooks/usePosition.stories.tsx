import { MemoryConfigStore } from "@orderly.network/core";
import { OrderlyProvider } from "../../provider";
import React, { FC, useMemo } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { API } from "@orderly.network/types";

import { usePositionStream } from "@orderly.network/hooks";

const PositionHookDemo: FC<{
  data: API.Position[];
  aggregated: any;
}> = (props) => {
  const children = useMemo(() => {
    return props.data.map((position, index) => {
      return (
        <div key={index}>
          <div>
            <pre>{JSON.stringify(position, null, 2)}</pre>
          </div>
          <div>
            <div className="orderly-flex orderly-gap-2 orderly-p-2 orderly-bg-slate-100">
              <input
                type="text"
                placeholder="Qty"
                className="orderly-border orderly-border-slate-500 orderly-px-2"
              />
              <input
                type="text"
                placeholder="Price"
                className="orderly-border orderly-border-slate-500 orderly-px-2"
              />
              <button className="orderly-border orderly-rounded orderly-px-2 orderly-border-slate-500">
                Limit Close
              </button>
              <button className="orderly-border orderly-rounded orderly-px-2 orderly-border-slate-500">
                Market Close
              </button>
            </div>
          </div>
        </div>
      );
    });
  }, [props.data]);
  return (
    <div className="orderly-text-black">
      <div>
        <pre>{JSON.stringify(props.aggregated, null, 2)}</pre>
      </div>
      <hr className="orderly-my-3" />
      <div>{children}</div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/usePositionStream",
  component: PositionHookDemo,
};

export default meta;

type Story = StoryObj<typeof PositionHookDemo>;

export const Default: Story = {
  render: () => {
    const [positions] = usePositionStream();

    return (
      <PositionHookDemo
        data={positions?.rows ?? []}
        aggregated={positions.aggregated}
      />
    );
  },
};
