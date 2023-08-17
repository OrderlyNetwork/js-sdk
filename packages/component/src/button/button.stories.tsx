import Button from ".";
import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedButton } from "./segmented";
// @ts-ignore
import React from "react";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: "Base/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "color" },
    onClick: { action: "clicked" },
  },
};

// type Story = StoryObj<typeof Button>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default = {
  args: {
    children: "Button",
    variant: "contained",
    size: "default",
  },
};

export const Buttons = {
  render: () => {
    return (
      <div className={"flex flex-col gap-3"}>
        <div className={"flex gap-3"}>
          <Button variant={"contained"} size={"small"}>
            Contained
          </Button>
          <Button variant={"outlined"} size={"small"}>
            Outlined
          </Button>
          <Button variant={"contained"} color={"sell"} size={"small"}>
            Sell
          </Button>{" "}
          <Button variant={"contained"} color={"buy"} size={"small"}>
            Buy
          </Button>
          <Button variant={"outlined"} size={"small"} color={"tertiary"}>
            Outlined
          </Button>
        </div>
        <div className={"flex gap-3"}>
          <Button variant={"contained"} color={"primary"}>
            Primary
          </Button>
          <Button variant={"outlined"} color={"tertiary"}>
            Tertiary
          </Button>{" "}
          <Button variant={"contained"} color={"sell"}>
            Sell
          </Button>{" "}
          <Button variant={"contained"} color={"buy"}>
            Buy
          </Button>
          <Button variant={"outlined"}>Outlined</Button>
        </div>
      </div>
    );
  },
};

//shadow-[inset_0px_-5px_1px]

export const Segmented = {
  render: () => {
    const [value, setValue] = React.useState("buy");
    return (
      <div className={"flex flex-col gap-3"}>
        <SegmentedButton
          buttons={[
            { label: "Buy", value: "buy" },
            { label: "Sell", value: "sell" },
          ]}
          onClick={(value) => {
            setValue(value);
          }}
          value={value}
        />
        <SegmentedButton
          buttons={[
            {
              label: "Buy",
              value: "buy",
              activeClassName:
                "bg-trade-profit text-trade-profit-foreground after:bg-trade-profit",
            },
            {
              label: "Sell",
              value: "sell",
              activeClassName:
                "bg-trade-loss text-trade-loss-foreground after:bg-trade-loss",
            },
          ]}
          onClick={(value) => {
            setValue(value);
          }}
          value={value}
        />
      </div>
    );
  },
};
