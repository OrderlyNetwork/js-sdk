import type { Meta, StoryObj } from "@storybook/react-vite";
import { PnlLineChart, VolBarChart, PnLBarChart } from "@orderly.network/chart";
import { Box } from "@orderly.network/ui";

const pnlBarData = [
  {
    date: "2023-05-01",
    pnl: 2301,
  },
  {
    date: "2023-05-02",
    pnl: 3789,
  },
  {
    date: "2023-05-03",
    pnl: 1543,
  },
  {
    date: "2023-05-04",
    pnl: 4231,
  },
  {
    date: "2023-05-05",
    pnl: 2945,
  },
  {
    date: "2023-05-06",
    pnl: 3771,
  },
  {
    date: "2023-05-07",
    pnl: 1987,
  },
  {
    date: "2023-05-08",
    pnl: 3612,
  },
  {
    date: "2023-05-09",
    pnl: 2234,
  },
  {
    date: "2023-05-10",
    pnl: 4098,
  },
  {
    date: "2023-05-11",
    pnl: 2675,
  },
  {
    date: "2023-05-12",
    pnl: 1765,
  },
  {
    date: "2023-05-13",
    pnl: 3892,
  },
  {
    date: "2023-05-14",
    pnl: 2417,
  },
  {
    date: "2023-05-15",
    pnl: 3135,
  },
  {
    date: "2023-05-16",
    pnl: 1439,
  },
  {
    date: "2023-05-17",
    pnl: 4567,
  },
  {
    date: "2023-05-18",
    pnl: 2801,
  },
  {
    date: "2023-05-19",
    pnl: 3220,
  },
  {
    date: "2023-05-20",
    pnl: 1978,
  },
];

const pnlLineData = [
  {
    broker_id: "demo",
    date: "2024-11-13",
    perp_volume: 88156.047958,
    pnl: -867.906318,
    account_value: 6460.62474,
    snapshot_time: 1731554721345,
  },
  {
    broker_id: "demo",
    date: "2024-11-14",
    perp_volume: 0,
    pnl: 672.715952,
    account_value: 7133.340692,
    snapshot_time: 1731629860129,
  },
  {
    broker_id: "demo",
    date: "2024-11-15",
    perp_volume: 73868.165996,
    pnl: 521.941453,
    account_value: 7655.282145,
    snapshot_time: 1731715694458,
  },
  {
    broker_id: "demo",
    date: "2024-11-16",
    perp_volume: 302.01696,
    pnl: -285.395666,
    account_value: 7369.886479,
    snapshot_time: 1731801672920,
  },
  {
    broker_id: "demo",
    date: "2024-11-17",
    perp_volume: 0,
    pnl: 106.605306,
    account_value: 7476.491785,
    snapshot_time: 1731888091773,
  },
  {
    broker_id: "demo",
    date: "2024-11-18",
    perp_volume: 308.9625,
    pnl: -827.6147,
    account_value: 6648.877085,
    snapshot_time: 1731974577854,
  },
  {
    broker_id: "demo",
    date: "2024-11-19",
    perp_volume: 0,
    pnl: 496.171504,
    account_value: 7145.048589,
    snapshot_time: 1731974577854,
  },
];

const meta: Meta<typeof PnlLineChart> = {
  title: "Chart/Chart",
  component: PnlLineChart,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Box width="500px" height={"400px"}>
        <Story />
      </Box>
    ),
  ],
  args: {
    data: pnlLineData,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const pnlBar: Story = {
  render: () => {
    return <PnLBarChart data={pnlBarData} />;
  },
};

export const EmptyPnlBar: Story = {
  render: (args) => {
    return <PnLBarChart {...args} />;
  },
  args: {
    data: [
      {
        date: "2023-05-01",
        pnl: 2301,
      },
      {
        date: "2023-05-02",
        pnl: 3789,
      },
      {
        date: "2023-05-03",
        pnl: 1543,
      },
      {
        date: "2023-05-04",
        pnl: 4231,
      },
      {
        date: "2023-05-05",
        pnl: 2945,
      },
      {
        date: "2023-05-06",
        pnl: 3771,
      },
      {
        date: "2023-05-07",
        pnl: 1987,
      },
      {
        date: "2023-05-08",
        pnl: 3612,
      },
      {
        date: "2023-05-09",
        pnl: 2234,
      },
      {
        date: "2023-05-10",
        pnl: 4098,
      },
      {
        date: "2023-05-11",
        pnl: 2675,
      },
      {
        date: "2023-05-12",
        pnl: 1765,
      },
      {
        date: "2023-05-13",
        pnl: 3892,
      },
      {
        date: "2023-05-14",
        pnl: 2417,
      },
      {
        date: "2023-05-15",
        pnl: 3135,
      },
      {
        date: "2023-05-16",
        pnl: 1439,
      },
      {
        date: "2023-05-17",
        pnl: 4567,
      },
      {
        date: "2023-05-18",
        pnl: 2801,
      },
      {
        date: "2023-05-19",
        pnl: 3220,
      },
      {
        date: "2023-05-20",
        pnl: 1978,
      },
    ],
    invisible: true,
  },
};

const volBarDataSource = [
  {
    date: "2023-05-01",
    volume: 2301,
  },
  {
    date: "2023-05-02",
    volume: 3789,
  },
  {
    date: "2023-05-03",
    volume: 1543,
  },
  {
    date: "2023-05-04",
    volume: 4231,
  },
  {
    date: "2023-05-05",
    volume: 2945,
  },
  {
    date: "2023-05-06",
    volume: 3771,
  },
  {
    date: "2023-05-07",
    volume: 1987,
  },
  {
    date: "2023-05-08",
    volume: 3612,
  },
  {
    date: "2023-05-09",
    volume: 2234,
  },
  {
    date: "2023-05-10",
    volume: 4098,
  },
  {
    date: "2023-05-11",
    volume: 2675,
  },
  {
    date: "2023-05-12",
    volume: 1765,
  },
  {
    date: "2023-05-13",
    volume: 3892,
  },
  {
    date: "2023-05-14",
    volume: 2417,
  },
  {
    date: "2023-05-15",
    volume: 3135,
  },
  {
    date: "2023-05-16",
    volume: 1439,
  },
  {
    date: "2023-05-17",
    volume: 4567,
  },
  {
    date: "2023-05-18",
    volume: 2801,
  },
  {
    date: "2023-05-19",
    volume: 3220,
  },
  {
    date: "2023-05-20",
    volume: 1978,
  },
];

export const VolBar: Story = {
  render: (args: any) => {
    return (
      <VolBarChart
        className="oui-h-full oui-w-full"
        data={volBarDataSource}
        colors={{ fill: "rgba(0, 180, 158, 1)" }}
      />
    );
  },
};

export const VolBarEmpty: Story = {
  render: (args: any) => {
    const data = volBarDataSource.map((e) => ({ ...e, opacity: 0, volume: 0 }));
    console.log("vol bar emtpy", data);

    return (
      <VolBarChart
        className="oui-h-full oui-w-full"
        data={data}
        colors={{ fill: "rgba(0, 180, 158, 1)" }}
      />
    );
  },
};
