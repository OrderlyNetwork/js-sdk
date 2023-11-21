import React, { FC } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { useWS } from "@orderly.network/hooks";

const WebSocketDemo: FC<{}> = (props) => {
  return (
    <div className="orderly-text-black">
      <div>
        <button>Subscrip</button>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/WebSocket",
  component: WebSocketDemo,
};

export default meta;

type Story = StoryObj<typeof WebSocketDemo>;

export const Default: Story = {
  render: () => {
    const ws = useWS();
    return <WebSocketDemo />;
  },
};
