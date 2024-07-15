import { FC, ReactNode, useMemo } from "react";
import {
  Box,
  Button,
  Column,
  DataTable,
  Divider,
  Flex,
  ScrollArea,
  Statistic,
  Text,
  cn,
  toast,
} from "@orderly.network/ui";
import { ReferralCodesReturns, ReferralCodeType } from "./referralCodes.script";
import { PinBtn } from "../../../components/pinButton";
import { useMediaQuery } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { EditIcon } from "../../../components/editIcon";

export const ReferralCodesUI: FC<ReferralCodesReturns> = (props) => {
  const isTablet = useMediaQuery("(max-width: 767px)");
  return (
    <Flex
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9"
    >
      <Title {...props} />

      <div className="oui-w-full oui-flex oui-flex-col">
        <Divider />
        {isTablet ? <MobileLayout {...props} /> : <DesktopLayout {...props} />}
      </div>
    </Flex>
  );
};

const Title: FC<ReferralCodesReturns> = (props) => {
  return (
    <Flex direction={"row"} justify={"between"} width={"100%"}>
      <Text className="oui-text-lg">Referral codes</Text>
      <div className="oui-text-2xs md:oui-text-xs xl:oui-text-sm">
        <Text className="oui-text-base-contrast-54">
          Remaining referral codes:&nbsp;
        </Text>
        <Text className="oui-text-primary-light">6</Text>
      </div>
    </Flex>
  );
};

const MobileLayout: FC<ReferralCodesReturns> = (props) => {
  return (
    <ScrollArea>
      <div className="oui-max-h-[240px]">
        {props.codes?.map((e, index) => {
          return (
            <MobileCell
              key={index}
              data={e}
              editRate={props.editRate}
              copyLink={props.copyLink}
              copyCode={props.copyCode}
              setPinCode={props.setPinCode}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};

const MobileCellItem: FC<{
  // key: string;
  title: string;
  value: string | ReactNode;
  copyable?: boolean;
  align?: "start" | "end" | undefined;
  className?: string;
  editRate?: () => void;
  onCopy?: () => void;
}> = (props) => {
  const { key, title, copyable, value, align, className, editRate, onCopy } =
    props;
  return (
    <Statistic
      key={key}
      className={cn("oui-flex-1", className)}
      label={
        <Text className="oui-text-base-contrast-36 oui-text-2xs">{title}</Text>
      }
      align={align}
      children={
        <Flex direction={"row"} gap={1}>
          <Text.formatted
            copyable={copyable}
            onCopy={() => {
              onCopy?.();
            }}
            className="oui-text-base-contrast-80 oui-text-sm oui-mt-[6px]"
          >
            {value as string}
          </Text.formatted>
          {editRate && (
            <EditIcon
              className=" oui-fill-white/[.36] hover:oui-fill-white/80 oui-cursor-pointer oui-mt-[1px]"
              fillOpacity={1}
              fill="currentColor"
              onClick={(e) => editRate()}
            />
          )}
        </Flex>
      }
    />
  );
};
const MobileCell: FC<{
  data: ReferralCodeType;
  setPinCode: (code: string, del?: boolean) => void;
  copyLink: (code: string) => void;
  copyCode: (code: string) => void;
  editRate: (code: ReferralCodeType) => void;
}> = (props) => {
  const { data, setPinCode, copyLink, copyCode, editRate } = props;

  return (
    <Flex
      key={data.code}
      pt={3}
      gap={3}
      direction={"column"}
      className="oui-w-full"
    >
      <Flex
        direction={"row"}
        justify={"between"}
        itemAlign={"stretch"}
        width={"100%"}
      >
        <MobileCellItem
          title="Referral code"
          value={data.code}
          copyable
          onCopy={() => {
            props.copyCode?.(data.code);
          }}
        />
        <MobileCellItem
          title="You / Referee"
          value={getRate(data)}
          align="end"
          editRate={() => {
            editRate(data);
          }}
        />
        <MobileCellItem
          title="Referees / Traders"
          value={getCount(data)}
          align="end"
          className={"oui-hidden md:oui-flex"}
        />
      </Flex>
      <Flex
        direction={"row"}
        justify={"between"}
        itemAlign={"stretch"}
        width={"100%"}
        className="md:oui-hidden"
      >
        <MobileCellItem
          title="Referees"
          value={getCount(data).split("/")?.[0]}
          align="start"
        />
        <MobileCellItem
          title="Traders"
          value={getCount(data).split("/")?.[1]}
          align="end"
        />
      </Flex>
      <Flex
        direction={"row"}
        justify={"between"}
        itemAlign={"stretch"}
        width={"100%"}
      >
        <PinBtn
          pinned={data.isPined || false}
          onClick={(e) => {
            setPinCode(data.code, !e);
          }}
        />
        <Button
          variant="outlined"
          size="xs"
          className="oui-px-[20px]"
          onClick={(e) => {
            copyLink(data.code);
          }}
        >
          Copy link
        </Button>
      </Flex>
    </Flex>
  );
};

const DesktopLayout: FC<ReferralCodesReturns> = (props) => {
  const moreColumn = useMediaQuery("(min-width: 1024px)");

  const columns = useMemo(() => {
    const cols: Column[] = [
      {
        title: "Referral Codes",
        dataIndex: "code",
        width: moreColumn ? 80 : 120,
        render: (value) => "CODE",
      },
      {
        title: "You / Referree",
        dataIndex: "dffd",
        width: moreColumn ? 80 : 120,
        render: (value) => "YOU/REFERREE",
      },
    ];

    if (moreColumn) {
      cols.push({
        title: "Referees",
        dataIndex: "1",
        width: 80,
        render: (value) => "98",
      });
      cols.push({
        title: "Traders",
        dataIndex: "2",
        width: 80,
        render: (value) => "98",
      });
    } else {
      cols.push({
        title: "Referees / Traders ",
        dataIndex: "abc",
        width: 120,
        fixed: "left",
        render: (value) => "REFEREES",
      });
    }

    cols.push({
      title: "",
      dataIndex: "",
      align: "right",
      width: 74,
      render: (value) => (
        <Button variant="outlined" size="sm" className="oui-px-5">
          Copy link
        </Button>
      ),
    });

    console.log("cols", cols);

    return cols;
  }, [moreColumn]);

  return (
    <DataTable
      columns={columns}
      dataSource={[1, 2, 3, 4, 5, 6, 7, 8]}
      scroll={{ y: 264 }}
      classNames={{
        header: "oui-text-xs oui-text-base-contrast-36",
        body: "oui-text-xs oui-text-base-contrast-80",
      }}
    ></DataTable>
  );
};

const getRate = (item: ReferralCodeType) => {
  const refereeRate = new Decimal(item.referee_rebate_rate)
    .mul(100)
    .toFixed(1, Decimal.ROUND_DOWN)
    .toString();
  const referralRate = new Decimal(item.referrer_rebate_rate)
    .mul(100)
    .toFixed(1, Decimal.ROUND_DOWN)
    .toString();
  return `${referralRate}% / ${refereeRate}%`;
};

const getCount = (item: ReferralCodeType) => {
  return `${item.total_invites} / ${item.total_traded}`;
};
