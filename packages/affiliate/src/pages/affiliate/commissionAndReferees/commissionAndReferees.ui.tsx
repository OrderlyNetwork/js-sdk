import { FC, ReactNode, useCallback, useMemo } from "react";
import {
  Column,
  DataTable,
  DatePicker,
  Divider,
  Flex,
  ListView,
  Pagination,
  ScrollArea,
  Statistic,
  TabPanel,
  Table,
  Tabs,
  Text,
  cn,
} from "@orderly.network/ui";
import { CommissionAndRefereesReturns } from "./commissionAndReferees.script";
import { RefferalAPI, useMediaQuery } from "@orderly.network/hooks";
import { DateRange } from "../../../utils/types";
import { formatYMDTime } from "../../../utils/utils";
import { commifyOptional } from "@orderly.network/utils";

export const CommissionAndReferees: FC<CommissionAndRefereesReturns> = (
  props
) => {
  return (
    <Flex
      id="oui-affiliate-affiliate-commissionAndReferees"
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9 oui-tabular-nums"
    >
      <Tabs defaultValue="account" className="oui-w-full">
        <TabPanel value="account" title="Commission">
          <CommissionList {...props} />
        </TabPanel>
        <TabPanel value="password" title="My referees">
          <RefereesList {...props} />
        </TabPanel>
      </Tabs>
    </Flex>
  );
};

const MobileCellItem: FC<{
  title: string;
  value: string | ReactNode;
  align?: "start" | "end" | undefined;
  className?: string;
  rule?: "address" | "date";
  formatString?: string;
  prefix?: string;
}> = (props) => {
  const { title, value, align, className, rule, formatString, prefix } = props;
  return (
    <Statistic
      className={cn("oui-flex-1", className)}
      label={
        <Text className="oui-text-base-contrast-36 oui-text-2xs">{title}</Text>
      }
      align={align}
      children={
        <Text.formatted
          rule={rule || ""}
          // @ts-ignore
          formatString={formatString}
          prefix={prefix}
          className="oui-text-base-contrast-80 oui-text-sm oui-mt-[6px]"
        >
          {value}
        </Text.formatted>
      }
    />
  );
};

const CommissionList: FC<CommissionAndRefereesReturns> = (props) => {
  const isLG = useMediaQuery("(max-width: 767px)");
  const columns = useMemo(() => {
    const cols: Column[] = [
      {
        title: "Commission (USDC)",
        dataIndex: "referral_rebate",
        render: (value) => (
          <Text>
            {commifyOptional(value, {fix: 6, fallback: "0", padEnd: true, prefix: '$'})}
          </Text>
        ),
        width: 216,
      },
      {
        title: "Referral vol. (USDC)",
        dataIndex: "volume",
        render: (value) => (
          <Text>
            {commifyOptional(value, {fix: 6, fallback: "0", padEnd: true, prefix: '$'})}
          </Text>
        ),
        width: 216,
      },
      {
        title: "Date",
        dataIndex: "date",
        render: (value) => formatYMDTime(value),
        width: 216,
      },
    ];

    return cols;
  }, []);

  const body = useMemo(() => {
    if (isLG) {
      return (
        <ListView<
          RefferalAPI.ReferralRebateSummary,
          RefferalAPI.ReferralRebateSummary[]
        >
          className="oui-w-full oui-max-h-[200px]"
          dataSource={props.commission.data}
          // dataSource={[]}
          loadMore={props.commission.loadMore}
          isLoading={props.commission.isLoading}
          renderItem={(e, index) => {
            return (
              <Flex direction={"row"} pt={3} width={"100%"}>
                <MobileCellItem
                  title="Commission"
                  value={commifyOptional(e.referral_rebate, { fix: 6, fallback: "0", padEnd: true })}
                  prefix="$"
                />
                <MobileCellItem
                  title="Referral vol."
                  value={commifyOptional(e.volume, { fix: 6, fallback: "0", padEnd: true })}
                  prefix="$"
                />
                <MobileCellItem
                  title="Date"
                  value={e.date}
                  rule="date"
                  formatString="yyyy-MM-dd"
                  align="end"
                />
              </Flex>
            );
          }}
        />
      );
    }

    return (
      <DataTable
        bordered
        columns={columns}
        dataSource={props.commission.data}
        classNames={{
          header: "oui-text-xs oui-text-base-contrast-36 oui-bg-base-9",
          body: "oui-text-xs oui-text-base-contrast-80 oui-max-h-[200px]",
        }}
      >
        <Pagination
          {...props.commission.meta}
          onPageChange={props.commission.onPageChange}
          onPageSizeChange={props.commission.onPageSizeChange}
        />
      </DataTable>
    );
  }, [isLG, props.commission]);

  return (
    <Flex
      direction={"column"}
      width={"100%"}
      justify={"start"}
      itemAlign={"start"}
    >
      <DateFiler
        value={props.commission.dateRange}
        setValue={props.commission.setDateRange}
      />
      {body}
    </Flex>
  );
};

const RefereesList: FC<CommissionAndRefereesReturns> = (props) => {
  const isLG = useMediaQuery("(max-width: 767px)");
  console.log("referees", props.referees);

  const columns = useMemo(() => {
    const cols: Column[] = [
      {
        title: "Referee address ",
        dataIndex: "user_address",
        render: (value) => (
          <Text.formatted rule={"address"}>{value}</Text.formatted>
        ),
        className: "oui-w-1/5",
      },
      {
        title: "Referral code ",
        dataIndex: "referral_code",
        // render: (value) => value,
        className: "oui-w-1/5",
      },
      {
        title: "Total commission (USDC) ",
        dataIndex: "referral_rebate",
        render: (value) => <Text.numeral dp={6}>{value || "-"}</Text.numeral>,
        className: "oui-w-1/5",
      },
      {
        title: "Total vol. (USDC) ",
        dataIndex: "volume",
        render: (value) => <Text.numeral dp={2}>{value || "-"}</Text.numeral>,
        className: "oui-w-1/5",
      },
      {
        title: "Invacation time",
        dataIndex: "code_binding_time",
        render: (value) => (
          <Text.formatted
            rule={"date"}
            formatString="yyyy-MM-dd"
            children={value}
          />
        ),
        className: "oui-w-1/5",
      },
    ];

    return cols;
  }, []);

  const body = useMemo(() => {
    if (isLG) {
      return (
        <ListView<RefferalAPI.RefereeInfoItem, RefferalAPI.RefereeInfoItem[]>
          className="oui-w-full oui-max-h-[200px]"
          dataSource={props.referees.data}
          loadMore={props.referees.loadMore}
          isLoading={props.referees.isLoading}
          renderItem={(e, index) => {
            return (
              <Flex
                key={index}
                direction={"column"}
                gap={3}
                className="oui-border-b-2 oui-border-line-6 oui-pb-3"
              >
                <Flex direction={"row"} width={"100%"}>
                  <MobileCellItem
                    title="Referral code "
                    value={e.referral_code}
                  />
                  <MobileCellItem
                    title="Total commission"
                    value={e.referral_rebate}
                    className="oui-min-w-[102px]"
                  />
                  <MobileCellItem
                    title="Total vol."
                    value={e.volume}
                    align="end"
                  />
                </Flex>
                <Flex direction={"row"} pt={3} gap={3} width={"100%"}>
                  <MobileCellItem
                    title="Referee address "
                    value={e.user_address}
                    rule="address"
                  />
                  <MobileCellItem
                    title="Invitation Time "
                    value={e.code_binding_time}
                    align="end"
                    rule="date"
                    formatString="yyyy-MM-dd"
                  />
                </Flex>
                {/* <Divider /> */}
              </Flex>
            );
          }}
        />
      );
    }

    return (
      <DataTable
        bordered
        columns={columns}
        dataSource={props.referees.data}
        classNames={{
          header: "oui-text-xs oui-text-base-contrast-36 oui-bg-base-9",
          body: "oui-text-xs oui-text-base-contrast-80 oui-max-h-[200px]",
        }}
      >
        <Pagination
          {...props.referees.meta}
          onPageChange={props.referees.onPageChange}
          onPageSizeChange={props.referees.onPageSizeChange}
        />
      </DataTable>
    );
  }, [isLG, props.referees]);

  return (
    <Flex
      direction={"column"}
      width={"100%"}
      justify={"start"}
      itemAlign={"start"}
    >
      <DateFiler
        value={props.referees.dateRange}
        setValue={props.referees.setDateRange}
      />
      {body}
    </Flex>
  );
};

const DateFiler: FC<{
  value?: DateRange;
  setValue: any;
}> = (props) => {
  return (
    <Flex width={"100%"} height={49} className="oui-border-b oui-border-line-6">
      <div>
        <DatePicker.range
          size="xs"
          value={props.value}
          onChange={(range) => {
            props.setValue(range);
          }}
        />
      </div>
    </Flex>
  );
};
