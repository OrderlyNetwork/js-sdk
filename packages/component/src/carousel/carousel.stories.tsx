import React, { useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

const meta: Meta = {
  title: "Base/Carousel",
  component: Carousel,
  args: {},

  argTypes: {},
};

type Story = StoryObj<typeof Carousel>;

export default meta;

export const Default: Story = {
  render: (args) => {
    return (
      <Carousel
        opts={{
          align: "start",
        }}
        className="orderly-w-full orderly-max-w-sm"
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="orderly-md:basis-1/2 orderly-lg:basis-1/3"
            >
              <div className="orderly-p-1">
                <div>
                  <div className="orderly-flex orderly-aspect-square orderly-items-center orderly-justify-center orderly-p-6">
                    <span className="orderly-text-3xl orderly-font-semibold">
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  },
};
