import { FC, ReactNode, useMemo } from "react";
import {
  Button,
  Column,
  DataTable,
  Divider,
  Flex,
  ScrollArea,
  Statistic,
  Text,
  cn,
} from "@orderly.network/ui";
import { ReferralCodesReturns } from "./referralCodes.script";
import { PinBtn } from "../../../components/pinButton";
import { useMediaQuery } from "@orderly.network/hooks";

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
      <MobileCell />
    </ScrollArea>
  );
};

const MobileCellItem: FC<{
  title: string;
  value: string | ReactNode;
  copyable?: boolean;
  align?: "start" | "end" | undefined;
  className?: string;
}> = (props) => {
  const { title, copyable, value, align, className } = props;
  return (
    <Statistic
      className={cn("oui-flex-1", className)}
      label={<Text className="oui-text-base-contrast-36 oui-text-2xs">{title}</Text>}
      align={align}
      children={
        <Text.formatted
          copyable={copyable}
          onCopy={() => {
            console.log("xxx copy finished");
          }}
          className="oui-text-base-contrast-80 oui-text-sm oui-mt-[6px]"
        >
          {value}
        </Text.formatted>
      }
    />
  );
};
const MobileCell = () => {
  return (
    <Flex px={3} pt={3} gap={3} direction={"column"} className="oui-w-full">
      <Flex
        direction={"row"}
        justify={"between"}
        itemAlign={"stretch"}
        width={"100%"}
      >
        <MobileCellItem title="Referral code" value="ASS" copyable />
        <MobileCellItem title="You / Referee" value="ASS" align="end" />
        <MobileCellItem
          title="Referees / Traders"
          value="ASS"
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
        <MobileCellItem title="Referees" value="ASS" align="start" />
        <MobileCellItem title="Traders" value="ASS" align="end" />
      </Flex>
      <Flex
        direction={"row"}
        justify={"between"}
        itemAlign={"stretch"}
        width={"100%"}
      >
        <PinBtn pinned />
        <Button variant="outlined" size="xs" className="oui-px-[20px]">
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
        width: moreColumn ? 237 : 150,
        render: (value) => "CODE",
      },
      {
        title: "You / Referree",
        dataIndex: "dffd",
        width: moreColumn ? 237 : 150,
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
        width: 150,
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
      classNames={{
        header: "oui-text-xs oui-text-base-contrast-36",
        body: "oui-text-xs oui-text-base-contrast-80",

      }}
    ></DataTable>
  );
};
