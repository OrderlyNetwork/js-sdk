import React, { useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { usePoster } from "@orderly.network/hooks";

const QueryDemo = () => {
  return <div></div>;
};

const meta: Meta = {
  title: "hooks/usePoster",
  component: QueryDemo,
  args: {
    // backgroundColor: "#0b8c70",
    backgroundImg: "/images/poster_bg.png",
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgb(0,181,159)",
    loseColor: "rgb(255,103,194)",
    brandColor: "rgb(0,181,159)",
    data: {
      message: "I am the WOO KING.",
      domain: "dex.woo.org",
      updateTime: "2022-JAN-01 23:23",
      position: {
        symbol: "WOO-PERP",
        currency: "USDC",
        side: "LONG",
        leverage: 20,
        pnl: -1032.23,
        ROI: -10.25,
        informations: [
          { title: "Open Price", value: 0.12313 },
          { title: "Opened at", value: "Jan-01 23:23" },
          { title: "Mark price", value: "0.12341" },
          { title: "Quantity", value: "0.123" },
        ],
      },
    },
    layout: {},
  },

  argTypes: {
    backgroundColor: { control: "color" },
    brandColor: { control: "color" },
    profitColor: { control: "color" },
    loseColor: { control: "color" },
    color: { control: "color" },
    backgroundImg: { control: { type: "file", accept: ".png" } },
    data: { control: "object" },
  },
};

type Story = StoryObj<typeof QueryDemo>;

export default meta;

export const Default: Story = {
  render: (args) => {
    const [init, setInit] = React.useState(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    usePoster(canvasRef.current, args);

    useEffect(() => {
      setInit(true);
    }, []);

    return (
      <div>
        <canvas ref={canvasRef} width={550} height={300} />
      </div>
    );
  },
};
