import type { StoryObj } from "@storybook/react";
import { Box, Text, TableView } from "@orderly.network/ui";
import { Columns } from "./columns";
import { DataSource } from "./dataSource";
import { useState } from "react";

const meta = {
  title: "Base/Table/Table",
  component: TableView,
  decorators: [(Story: any) => <Story />],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [pagination, setPagination] = useState({
      pageIndex: 1,
      pageSize: 20,
    });

    return (
      <Box width={600} height={600} p={3} intensity={900}>
        <TableView
          columns={Columns}
          dataSource={DataSource}
          // getRowCanExpand={() => true}
          // renderRowExpand={(row) => {
          //   return (
          //     <pre style={{ fontSize: "10px" }} className="oui-bg-base-8">
          //       <code>{JSON.stringify(row.original, null, 2)}</code>
          //     </pre>
          //   );
          // }}
          border={{ header: { top: true, bottom: true }, body: true }}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </Box>
    );
  },
};
