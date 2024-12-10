import { Box, Flex, ListView } from "@orderly.network/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { ReactNode, useState } from "react";
// @ts-ignore
import React from "react";

const meta: Meta<typeof ListView> = {
  title: "Base/ListView",
  component: ListView,
};

export default meta;

type Story = StoryObj<typeof ListView>;

export const Default: Story = {
  render: () => {
    const dataSource = Array.from({ length: 100 }, (_, index) => index);

    return (
      <Flex direction={"column"} gap={3} className="oui-h-screen oui-flex">
        <Box width={"100%"} className="oui-bg-slate-700 oui-flex-1"></Box>

        <ListView
          dataSource={dataSource}
          className="oui-flex-1 oui-w-full"
          renderItem={function (item: number): ReactNode {
            return (
              <div className="oui-w-full oui-m-1 oui-bg-slate-500 oui-p-5">
                {item}
              </div>
            );
          }}
        />

        <Box
          width={"100%"}
          height={200}
          className="oui-bg-slate-700  oui-flex-1"
        ></Box>
      </Flex>
    );
  },
};

export const LoadMore: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSouce] = useState([1, 2, 3, 4, 5, 6, 7,8]);

    return (
      <>
        <ListView
          dataSource={dataSource}
          isLoading={loading}
          className="oui-min-h-[50px] oui-max-h-[300px]"
          renderItem={function (item: number): ReactNode {
            return (
              <div className="oui-w-full oui-mt-1 oui-bg-slate-500 oui-p-5">
                {item}
              </div>
            );
          }}
          loadMore={() => {
            setLoading(true);
            setTimeout(() => {
              setDataSouce((e) => {
                return [
                  ...e,
                  ...Array.from({ length: 10 }).map(
                    (_, index) => e.length + 1 + index
                  ),
                ];
              });
              setLoading(false);
            }, 1000);
          }}
        />
      </>
    );
  },
};
