import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Flex,
  Column,
  Text,
  DatePicker,
  ListView,
  Divider,
} from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { commifyOptional } from "@orderly.network/utils";
import { formatYMDTime } from "../../../../utils/utils";
import { AddressCell, MobileCell, MobileCard } from "./cells";
import {
  ReferrerTableScriptReturns,
  CommissionDataType,
} from "./referrerTable.script";

type CommissionTableProps = Pick<
  ReferrerTableScriptReturns,
  | "commissionData"
  | "isLoading"
  | "pagination"
  | "onSort"
  | "dateRange"
  | "setDateRange"
>;

const MobileCommissionItem: FC<{
  item: CommissionDataType;
}> = ({ item }) => {
  const { t } = useTranslation();
  return (
    <MobileCard>
      <MobileCell label={t("common.date")}>
        <Text>{formatYMDTime(item.date)}</Text>
      </MobileCell>
      <MobileCell label={t("common.code")}>
        <Text>{item.code}</Text>
      </MobileCell>
      <MobileCell label={t("common.volume")} align="end">
        <Text>
          {commifyOptional(item.volume, {
            fix: 2,
            fallback: "0",
            padEnd: true,
            prefix: "$",
          })}
        </Text>
      </MobileCell>
      <MobileCell label={t("affiliate.commission")}>
        <Text>
          {commifyOptional(item.commission, {
            fix: 6,
            fallback: "0",
            padEnd: true,
            prefix: "$",
          })}
        </Text>
      </MobileCell>
      <MobileCell
        label={t("common.address")}
        align="end"
        className="oui-col-start-3"
      >
        <AddressCell address={item.address} title={t("common.address")} />
      </MobileCell>
    </MobileCard>
  );
};

export const CommissionTable: FC<CommissionTableProps> = (props) => {
  const { t } = useTranslation();
  const showPagination = (props.pagination?.count ?? 0) >= 10;

  const columns = useMemo<Column<CommissionDataType>[]>(() => {
    return [
      {
        title: t("common.date"),
        dataIndex: "date",
        render: (value: string) => formatYMDTime(value),
      },
      {
        title: t("common.code"),
        dataIndex: "code",
      },
      {
        title: t("common.volume"),
        dataIndex: "volume",
        render: (value: number) => (
          <Text>
            {commifyOptional(value, {
              fix: 2,
              fallback: "0",
              padEnd: true,
              prefix: "$",
            })}
          </Text>
        ),
        onSort: true,
      },
      {
        title: t("affiliate.commission"),
        dataIndex: "commission",
        render: (value: number) => (
          <Text>
            {commifyOptional(value, {
              fix: 6,
              fallback: "0",
              padEnd: true,
              prefix: "$",
            })}
          </Text>
        ),
        onSort: true,
      },
      {
        title: t("common.address"),
        dataIndex: "address",
        render: (value: string) => (
          <AddressCell address={value} title={t("common.address")} />
        ),
      },
    ];
  }, [t]);

  return (
    <div className="oui-flex oui-w-full oui-flex-col">
      <Flex width="100%" height={49} className="oui-border-b oui-border-line-6">
        <div className="oui-px-3">
          <DatePicker.range
            size="xs"
            value={props.dateRange}
            onChange={props.setDateRange}
            max={90}
            disabled={{ after: new Date() }}
          />
        </div>
      </Flex>

      <div
        className={`oui-hidden oui-px-3 md:oui-block ${showPagination ? "" : "oui-pb-3"}`}
      >
        <AuthGuardDataTable
          bordered
          columns={columns}
          dataSource={props.commissionData}
          loading={props.isLoading}
          pagination={showPagination ? props.pagination : undefined}
          onSort={props.onSort}
          onRow={() => ({ className: "oui-h-12" })}
          className="[&_.oui-h-10.oui-w-full]:!oui-mx-0 [&_.oui-table-pagination]:!oui-justify-end [&_th]:!oui-tracking-[0.03em] [&_th]:!oui-px-3 [&_td]:!oui-px-3"
        />
      </div>
      <div className="oui-flex oui-flex-col oui-px-4 md:oui-hidden">
        <ListView
          dataSource={props.commissionData}
          contentClassName="!oui-space-y-0 oui-pb-3"
          renderItem={(item, index) => (
            <div key={index}>
              <MobileCommissionItem item={item} />
              <Divider intensity={8} />
            </div>
          )}
        />
      </div>
    </div>
  );
};
