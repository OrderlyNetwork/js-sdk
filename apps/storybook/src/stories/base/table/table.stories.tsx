import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  DataTable,
  Input,
  Flex,
  cn,
  usePagination,
  Badge,
  Text,
} from "@orderly.network/ui";
import { Columns } from "./columns";
import { DataSource, DataSourceWithChildren } from "./dataSource";

const meta: Meta<typeof DataTable> = {
  title: "Base/Table/Table",
  component: DataTable,
  decorators: [(Story: any) => <Story />],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [dataSource, setDataSource] = useState([] as any);
    const { pagination } = usePagination({
      pageSize: 20,
    });

    const [loading, setLoading] = useState(true);

    const [columnFilters, setColumnFilters] = useState({
      id: "symbol",
      value: "",
    });

    useEffect(() => {
      setTimeout(() => {
        setDataSource(DataSourceWithChildren);
        setLoading(false);
      }, 2000);
    }, []);

    return (
      <Box width={800} height={600} p={3} intensity={900}>
        <Flex gapX={1} mb={3}>
          <Input
            value={columnFilters.value}
            onValueChange={(value) => {
              setColumnFilters({
                ...columnFilters,
                value,
              });
            }}
            placeholder="Search"
            classNames={{ root: "oui-w-[200px] oui-border oui-border-line" }}
            size="sm"
            autoComplete="off"
          />
        </Flex>
        <DataTable
          columns={Columns}
          dataSource={dataSource}
          expanded={{
            main_account: true,
            sub_account: true,
            // PERP_TIA_USDC: true,
          }}
          getRowCanExpand={() => true}
          expandRowRender={(row) => {
            return (
              <div>
                <Badge>Top</Badge>
              </div>
            );
            return (
              <pre style={{ fontSize: "10px" }} className="oui-bg-base-8">
                <code>{JSON.stringify(row.original, null, 2)}</code>
              </pre>
            );
          }}
          getSubRows={(row) => row.children}
          bordered
          pagination={pagination}
          loading={loading}
          onCell={(column, record, index) => {
            const isGroup = record.children?.length > 0;
            if (isGroup) {
              return {
                children:
                  column.id === "symbol" ? (
                    <Badge color="neutral" size="xs">
                      {record.title}
                    </Badge>
                  ) : null,
              };
            }
          }}
          classNames={{
            root: cn(
              "!oui-h-[calc(100%_-_40px)]",
              "oui-border-t oui-border-line",
            ),
            // header: "oui-text-base oui-text-base-contrast-80",
            // body: "oui-text-base oui-text-base-contrast-36",
          }}
          // onRow={(record) => {
          //   return {
          //
          // className: "oui-h-6",
          //   };
          // }}
          columnFilters={columnFilters}
          generatedRowKey={(record) => record.symbol}
          // rowSelection={{ PERP_BTC_USDC: true }}
        />
      </Box>
    );
  },
};

export const Expandable: Story = {
  render: () => {
    const [expanded, setExpanded] = useState({});
    return (
      <DataTable
        columns={Columns}
        dataSource={DataSource}
        generatedRowKey={(record) => record.symbol}
        expanded={expanded}
        onExpandedChange={setExpanded}
        getRowCanExpand={() => true}
        onRow={(record, index, row) => {
          return {
            // onClick: row.getToggleExpandedHandler(),
          };
        }}
        expandRowRender={(row) => {
          return (
            <pre style={{ fontSize: "10px" }} className="oui-bg-base-8">
              <code>{JSON.stringify(row.original, null, 2)}</code>
            </pre>
          );
        }}
      />
    );
  },
};

export const MultiFieldSorting: Story = {
  render: () => {
    const [dataSource, setDataSource] = useState([] as any);
    const { pagination } = usePagination({
      pageSize: 20,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setTimeout(() => {
        const filteredDataSource = DataSourceWithChildren.filter(
          (item) =>
            item.symbol !== "main_account" && item.symbol !== "sub_account",
        );
        setDataSource(filteredDataSource);
        setLoading(false);
      }, 2000);
    }, []);

    // Column configuration specifically created for multi-field sorting example
    // Keep the original columns but add a multi-field sorting column
    const multiSortColumns = [
      ...Columns.filter(
        (column) =>
          column.dataIndex !== "mark_price" &&
          column.dataIndex !== "index_price",
      ),
      {
        title: "Price Analysis",
        dataIndex: "price_analysis",
        width: 250,
        multiSort: {
          fields: [
            {
              sortKey: "24h_close",
              label: "Current",
            },
            {
              sortKey: "mark_price",
              label: "Mark",
            },
            {
              sortKey: "index_price",
              label: "Index",
            },
          ],
        },
        render: (_: any, record: any) => {
          return (
            <div className="oui-space-y-1">
              <div className="oui-flex oui-items-center oui-justify-between">
                <Text className="oui-text-xs oui-text-base-contrast-54">
                  Current:
                </Text>
                <Text.numeral
                  dp={record.quote_dp || 2}
                  currency="$"
                  className="oui-text-xs"
                >
                  {record["24h_close"]}
                </Text.numeral>
              </div>
              <div className="oui-flex oui-items-center oui-justify-between">
                <Text className="oui-text-xs oui-text-base-contrast-54">
                  Mark:
                </Text>
                <Text.numeral
                  dp={record.quote_dp || 2}
                  currency="$"
                  className="oui-text-xs"
                >
                  {record.mark_price}
                </Text.numeral>
              </div>
              <div className="oui-flex oui-items-center oui-justify-between">
                <Text className="oui-text-xs oui-text-base-contrast-54">
                  Index:
                </Text>
                <Text.numeral
                  dp={record.quote_dp || 2}
                  currency="$"
                  className="oui-text-xs"
                >
                  {record.index_price}
                </Text.numeral>
              </div>
            </div>
          );
        },
      },
    ];

    return (
      <Box width={1000} height={600} p={3} intensity={900}>
        <Flex direction="column" gapY={3}>
          <div>
            <h3 className="oui-text-lg oui-font-semibold oui-mb-2">
              Multi-Field Sorting Example
            </h3>
            <p className="oui-text-sm oui-text-base-contrast-54">
              Click on the Current, Mark, or Index labels in the price column
              header to sort by different price fields. Multiple fields can be
              sorted simultaneously.
            </p>
          </div>

          <DataTable
            columns={multiSortColumns}
            dataSource={dataSource}
            // expanded={{
            //   main_account: true,
            //   sub_account: true,
            //   // PERP_TIA_USDC: true,
            // }}
            getSubRows={(row) => row.children}
            bordered
            pagination={pagination}
            loading={loading}
            onCell={(column, record, index) => {
              const isGroup = record.children?.length > 0;
              if (isGroup) {
                return {
                  children:
                    column.id === "symbol" ? (
                      <Badge color="neutral" size="xs">
                        {record.title}
                      </Badge>
                    ) : null,
                };
              }
            }}
            classNames={{
              root: cn(
                "!oui-h-[calc(100%_-_40px)]",
                "oui-border-t oui-border-line",
              ),
            }}
            generatedRowKey={(record) => record.symbol}
          />
        </Flex>
      </Box>
    );
  },
};
