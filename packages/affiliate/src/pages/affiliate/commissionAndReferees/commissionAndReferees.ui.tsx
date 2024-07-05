import { FC, ReactNode, useCallback, useMemo } from "react";
import {
  Column,
  DataTable,
  DatePicker,
  Divider,
  Flex,
  ScrollArea,
  Statistic,
  TabPanel,
  Table,
  Tabs,
  Text,
  cn,
} from "@orderly.network/ui";
import {
  CommissionAndRefereesReturns,
  DateRange,
} from "./commissionAndReferees.script";
import { useMediaQuery } from "@orderly.network/hooks";

export const CommissionAndRefereesUI: FC<CommissionAndRefereesReturns> = (
  props
) => {
  return (
    <Flex
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9"
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
}> = (props) => {
  const { title, value, align, className, rule, formatString } = props;
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
          formatString={formatString}
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
        dataIndex: "commission",
        render: (value) => "$123,22.21",
        width: 216,
      },
      {
        title: "Referral vol. (USDC)",
        dataIndex: "referral_vol",
        render: (value) => "$123,22.21",
        width: 216,
      },
      {
        title: "Date",
        dataIndex: "commission",
        render: (value) => "$123,22.21",
        width: 216,
      },
    ];

    return cols;
  }, []);

  const mCell = useCallback(() => {
    return (
      <Flex direction={"row"} pt={3} width={"100%"}>
        <MobileCellItem title="Commission" value="$222.222" />
        <MobileCellItem title="Referral vol." value="$222.222" />
        <MobileCellItem title="Date" value="$222.222" align="end" />
      </Flex>
    );
  }, [isLG]);

  const body = useMemo(() => {
    if (isLG) {
      return (
        <ScrollArea className="oui-w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(() => {
            return <>{mCell()}</>;
          })}
        </ScrollArea>
      );
    }

    return (
      <DataTable
        columns={columns}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8]}
        classNames={{
          header: "oui-text-xs oui-text-base-contrast-36",
          body: "oui-text-xs oui-text-base-contrast-80",
        }}
      />
    );
  }, [isLG]);

  return (
    <Flex
      direction={"column"}
      width={"100%"}
      justify={"start"}
      itemAlign={"start"}
    >
      <DateFiler
        value={props.commissionRange}
        setValue={props.setCommissionRange}
      />
      {body}
    </Flex>
  );
};

const RefereesList: FC<CommissionAndRefereesReturns> = (props) => {
  const isLG = useMediaQuery("(max-width: 767px)");
  const columns = useMemo(() => {
    const cols: Column[] = [
      {
        title: "Referee address ",
        dataIndex: "address",
        render: (value) => (
          <Text.formatted rule={"address"}>
            0x7c3409f33545e069083b4f7386b966d997488dc1
          </Text.formatted>
        ),
        className: "oui-w-1/5",
      },
      {
        title: "Referral code ",
        dataIndex: "code",
        render: (value) => "$123,22.21",
        className: "oui-w-1/5",
      },
      {
        title: "Total commission (USDC) ",
        dataIndex: "total_commission",
        render: (value) => "$123,22.21",
        className: "oui-w-1/5",
      },
      {
        title: "Total vol (USDC) ",
        dataIndex: "total_vol",
        render: (value) => "$123,22.21",
        className: "oui-w-1/5",
      },
      {
        title: "Invacation time",
        dataIndex: "time",
        render: (value) => (
          <Text.formatted
            rule={"date"}
            formatString="yyyy-MM-dd"
            children={"2024-08-09"}
          />
        ),
        className: "oui-w-1/5",
      },
    ];

    return cols;
  }, []);

  const mCell = useCallback(() => {
    return (
      <Flex direction={"column"} gap={3}>
        <Flex direction={"row"} pt={3} width={"100%"}>
          <MobileCellItem title="Referral code " value="$222.222" />
          <MobileCellItem
            title="Total commission"
            value="$222.222"
            className="oui-min-w-[102px]"
          />
          <MobileCellItem title="Total vol." value="$222.222" align="end" />
        </Flex>
        <Flex direction={"row"} pt={3} gap={3} width={"100%"}>
          <MobileCellItem
            title="Referee address "
            value="0x7c3409f33545e069083b4f7386b966d997488dc1"
            rule="address"
          />
          <MobileCellItem
            title="Invitation Time "
            value="2024-08-07"
            align="end"
            rule="date"
            formatString="yyyy-MM-dd"
          />
        </Flex>
      </Flex>
    );
  }, [isLG]);

  const body = useMemo(() => {
    if (isLG) {
      return (
        <ScrollArea className="oui-w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(() => {
            return <>{mCell()}</>;
          })}
        </ScrollArea>
      );
    }

    return (
      <DataTable
        columns={columns}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8]}
        // scroll={{x: 856}}
        // className="oui-min-w-[856px]"
        classNames={{
          header: "oui-text-xs oui-text-base-contrast-36",
          body: "oui-text-xs oui-text-base-contrast-80",
        }}
      />
    );
  }, [isLG]);

  return (
    <Flex
      direction={"column"}
      width={"100%"}
      justify={"start"}
      itemAlign={"start"}
    >
      <DateFiler
        value={props.commissionRange}
        setValue={props.setCommissionRange}
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
