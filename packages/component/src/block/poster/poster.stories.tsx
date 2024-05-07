import React, { useEffect, useRef } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Poster, type PosterRef } from "./poster";
import { Carousel } from "../../carousel";
import { Button } from "../../button/button";

// const {Content,} = Carousel;

const POSTERS = [
  {
    // backgroundColor: "#0b8c70",
    backgroundImg: "/images/poster_bg_5.png",
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgb(0,181,159)",
    lossColor: "rgb(255,103,194)",
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
        pnl: 10432.23,
        ROI: 20.25,
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
  {
    // backgroundColor: "#0b8c70",
    backgroundImg: "/images/poster_bg_1.png",
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgb(0,181,159)",
    lossColor: "rgb(255,103,194)",
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
  {
    // backgroundColor: "#0b8c70",
    backgroundImg: "/images/poster_bg_5.png",
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgb(0,181,159)",
    lossColor: "rgb(255,103,194)",
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
  {
    // backgroundColor: "#0b8c70",
    backgroundImg: "/images/poster_bg_2.png",
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgb(0,181,159)",
    lossColor: "rgb(255,103,194)",
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
];

const meta: Meta = {
  title: "Block/Poster",
  component: Poster,
  args: {
    // backgroundColor: "#0b8c70",
    backgroundImg: "/images/poster_bg_3.png",
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgb(0,181,159)",
    lossColor: "rgb(255,103,194)",
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
      referral: {
        code: "WRECKED",
        link: "https://woo.org?size=100",
        slogan: "Try WOOFi Pro now with:",
      },
    },
    layout: {},
  },

  argTypes: {
    backgroundColor: { control: "color" },
    brandColor: { control: "color" },
    profitColor: { control: "color" },
    lossColor: { control: "color" },
    color: { control: "color" },
    backgroundImg: { control: { type: "file", accept: ".png" } },
    data: { control: "object" },
  },
};

type Story = StoryObj<typeof Poster>;

export default meta;

export const Default: Story = {
  render: (args) => {
    const posterRef = useRef<PosterRef | null>(null);
    return (
      <div>
        <Poster width={500} height={300} data={args} ref={posterRef} />
        <div className="orderly-mt-3 orderly-flex orderly-gap-2">
          <Button
            size={"small"}
            onClick={() => {
              posterRef.current?.download("poster.png");
            }}
          >
            Download image
          </Button>
          <Button
            size={"small"}
            onClick={() => {
              posterRef.current?.copy();
            }}
          >
            Copy image
          </Button>
        </div>
      </div>
    );
  },
};

export const MultiplePosters: Story = {
  render: (args) => {
    return (
      <div className="orderly-px-20 orderly-h-[300px]">
        <Carousel
          opts={{
            align: "start",
          }}
          className="orderly-w-[500px]"
        >
          <Carousel.Content>
            {POSTERS.map((data, index) => (
              <Carousel.Item key={index}>
                <Poster width={500} height={300} data={data} />
              </Carousel.Item>
            ))}
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
        </Carousel>
      </div>
    );
  },
};

export const CustomFontFamily: Story = {
  render: (args) => {
    const posterRef = useRef<PosterRef | null>(null);
    return (
      <div>
        <Poster
          width={500}
          height={300}
          data={{ ...args, fontFamily: "DIN 2014" }}
          ref={posterRef}
        />
        {/* <div className="orderly-mt-3 orderly-flex orderly-gap-2">
        <Button
          size={"small"}
          onClick={() => {
            posterRef.current?.download("poster.png");
          }}
        >
          Download image
        </Button>
        <Button
          size={"small"}
          onClick={() => {
            posterRef.current?.copy();
          }}
        >
          Copy image
        </Button>
      </div> */}
      </div>
    );
  },
};
