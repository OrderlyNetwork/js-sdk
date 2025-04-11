import type { Meta, StoryObj } from "@storybook/react";
import {
  FeeTierModule,
  PortfolioLeftSidebarPath,
} from "@orderly.network/portfolio";
import { Column } from "@orderly.network/ui";
import { numberToHumanStyle } from "@orderly.network/utils";
import { PortfolioLayout } from "../../../components/layout";

const meta: Meta<typeof FeeTierModule.FeeTierPage> = {
  title: "Package/portfolio/FeeTier",
  component: FeeTierModule.FeeTierPage,
  subcomponents: {},
  parameters: {},
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    return (
      <PortfolioLayout currentPath={PortfolioLeftSidebarPath.FeeTier}>
        <FeeTierModule.FeeTierPage />
      </PortfolioLayout>
    );
  },
};

export const CustomData: Story = {
  render: () => {
    return (
      <FeeTierModule.FeeTierPage
        dataAdapter={(columns, dataSource) => {
          const cols: Column[] = [
            ...columns.slice(0, 2),
            {
              title: "or",
              dataIndex: "or",
              width: 120,
              align: "center",
            },
            {
              title: "Staking",
              dataIndex: "staking",
              align: "center",
              width: 150,
              render: (value, row) => {
                const { staking_min, staking_max } = row;
                if (!staking_min && !staking_max) {
                  return <div style={{ fontVariantLigatures: "none" }}>--</div>;
                }

                if (staking_min && !staking_max) {
                  return (
                    <div>
                      {"Above "}
                      {numberToHumanStyle(staking_min, 0)}
                    </div>
                  );
                }

                return (
                  <div>
                    {staking_min && numberToHumanStyle(staking_min, 0)}
                    {` - `}
                    {staking_max && numberToHumanStyle(staking_max, 0)}
                  </div>
                );
              },
            },
            ...columns.slice(2),
          ];
          return {
            columns: cols,
            dataSource: dataSource?.map((item, index) => ({
              ...item,
              ...CustomDataSource[index],
            })),
          };
        }}
      />
    );
  },
};

const CustomDataSource = [
  {
    tier: 1,
    or: "/",
    staking_min: null,
    staking_max: null,
  },
  {
    tier: 2,
    or: "/",
    staking_min: 12000,
    staking_max: 30000,
  },
  {
    tier: 3,
    or: "/",
    staking_min: 30000,
    staking_max: 120000,
  },
  {
    tier: 4,
    or: "/",
    staking_min: 120000,
    staking_max: 300000,
  },
  {
    tier: 5,
    or: "/",
    staking_min: 300000,
    staking_max: null,
  },
  {
    tier: 6,
    or: "/",
    staking: null,
    staking_min: null,
    staking_max: null,
  },
];
