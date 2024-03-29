import React, { useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  Carousel,
  CarouselContent,
  CarouselIdentifier,
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
      <div className="orderly-px-10">
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
                <div className="orderly-p-1 orderly-bg-slate-50">
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
      </div>
    );
  },
};

export const CarouselSize: Story = {
  render: (args) => {
    return (
      <div className="orderly-px-20 orderly-h-[350px]">
        <Carousel
          opts={{
            align: "start",
          }}
          className="orderly-max-w-sm "
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="orderly-basis-1/3">
                <div className="orderly-p-1 orderly-bg-base-300">
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
      </div>
    );
  },
};

export const Identifier: Story = {
  render: (args) => {
    return (
      <div className="orderly-px-10">
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
                <div className="orderly-p-1 orderly-bg-slate-50">
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
          <div className="orderly-mt-2">
            <CarouselIdentifier />
          </div>
        </Carousel>
      </div>
    );
  },
};

export const IdentifierCustomStyle: Story = {
  render: (args) => {
    return (
      <div className="orderly-px-10">
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
                <div className="orderly-p-1 orderly-bg-slate-50">
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
          <div className="orderly-mt-2 orderly-flex orderly-justify-center">
            <CarouselIdentifier
              dotClassName="orderly-w-[20px] orderly-h-[4px] orderly-bg-base-300"
              dotActiveClassName="orderly-bg-red-500"
            />
          </div>
        </Carousel>
      </div>
    );
  },
};
