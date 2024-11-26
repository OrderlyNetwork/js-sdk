import { FC, ReactNode, useMemo } from "react";
import {
  DatePicker,
  Divider,
  Flex,
  ListView,
  Statistic,
  TabPanel,
  TableColumn,
  Tabs,
  Text,
  cn,
} from "@orderly.network/ui";
import { CommissionAndRefereesReturns } from "./commissionAndReferees.script";
import { RefferalAPI, useMediaQuery } from "@orderly.network/hooks";
import { DateRange } from "../../../utils/types";
import { formatYMDTime } from "../../../utils/utils";
import { commifyOptional } from "@orderly.network/utils";
import { AuthGuardTableView } from "@orderly.network/ui-connector";

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
      <Tabs defaultValue="account" className="oui-w-full" variant="contained">
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
    const cols: TableColumn[] = [
      {
        title: "Commission (USDC)",
        dataIndex: "referral_rebate",
        render: (value) => (
          <Text>
            {commifyOptional(value, {
              fix: 6,
              fallback: "0",
              padEnd: true,
              prefix: "$",
            })}
          </Text>
        ),
        width: 216,
      },
      {
        title: "Referral vol. (USDC)",
        dataIndex: "volume",
        render: (value) => (
          <Text>
            {commifyOptional(value, {
              fix: 2,
              fallback: "0",
              padEnd: true,
              prefix: "$",
            })}
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
              <div>
                <Flex direction={"row"} width={"100%"}>
                  <MobileCellItem
                    title="Commission"
                    value={commifyOptional(e.referral_rebate, {
                      fix: 6,
                      fallback: "0",
                      padEnd: true,
                    })}
                    prefix="$"
                  />
                  <MobileCellItem
                    title="Referral vol."
                    value={commifyOptional(e.volume, {
                      fix: 2,
                      fallback: "0",
                      padEnd: true,
                    })}
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
                <Divider className="oui-w-full oui-mt-3" />
              </div>
            );
          }}
        />
      );
    }

    return (
      <AuthGuardTableView
        bordered
        columns={columns}
        loading={props.commission.isLoading}
        ignoreLoadingCheck={true}
        dataSource={props.commission.data}
        pagination={props.commission.pagination}
        onRow={(record) => {
          return {
            className: "oui-h-[41px]",
          };
        }}
      />
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

  const columns = useMemo(() => {
    const cols: TableColumn[] = [
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
        render: (value) => (
          <Text>
            {commifyOptional(value, { fix: 6, prefix: "$", padEnd: true })}
          </Text>
        ),
        className: "oui-w-1/5",
      },
      {
        title: "Total vol. (USDC) ",
        dataIndex: "volume",
        render: (value) => (
          <Text>
            {commifyOptional(value, { fix: 2, prefix: "$", padEnd: true })}
          </Text>
        ),
        className: "oui-w-1/5",
      },
      {
        title: "Invication time",
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
                    value={commifyOptional(e.referral_rebate, {
                      fix: 6,
                      prefix: "$",
                      padEnd: true,
                    })}
                    className="oui-min-w-[102px]"
                  />
                  <MobileCellItem
                    title="Total vol."
                    value={commifyOptional(e.volume, {
                      fix: 2,
                      prefix: "$",
                      padEnd: true,
                    })}
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
      <AuthGuardTableView
        bordered
        loading={props.referees.isLoading}
        ignoreLoadingCheck={true}
        columns={columns}
        dataSource={props.referees.data}
        pagination={props.referees.pagination}
        onRow={(record) => {
          return {
            className: "oui-h-[41px]",
          };
        }}
      />
    );
  }, [isLG, props.referees]);

  return (
    <Flex
      direction={"column"}
      width={"100%"}
      justify={"start"}
      itemAlign={"start"}
    >
      {/* <DateFiler
        value={props.referees.dateRange}
        setValue={props.referees.setDateRange}
      /> */}
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
          max={90}
          disabled={{
            after: new Date(),
          }}
        />
      </div>
    </Flex>
  );
};
