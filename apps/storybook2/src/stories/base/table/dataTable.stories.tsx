import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Card, DataTable, Filter } from '@orderly.network/ui';
import { OverviewModule } from '@orderly.network/portfolio';
import { OrderlyApp } from '@orderly.network/react-app';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Base/Table/DataTable',
  component: DataTable,
  parameters: {
    // layout: 'centered',
  },
  decorators: [
    (Story) => (
      <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}><Card><Story /></Card></OrderlyApp>)
  ],
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  args: {
    bordered: true,
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    columns: [
      { title: 'Symbol', dataIndex: 'symbol' },
    ],
    dataSource: [
      {
        symbol: 'ETH',
      }
    ]
  },
};


export const DataFilter: Story = {
  render: (args) => {
    const columns = OverviewModule.useAssetHistoryColumns();
    const { dataSource, onSearch } = OverviewModule.useAssetHistoryHook();
    return <DataTable {...args} columns={columns} dataSource={dataSource}>

    </DataTable>
  }
}
