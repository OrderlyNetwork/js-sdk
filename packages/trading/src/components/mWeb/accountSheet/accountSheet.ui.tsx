import { FC } from "react";
import {
  ArrowRightShortIcon,
  Button,
  Flex,
  Text,
} from "@orderly.network/ui";
import { AccountSheetState } from "./accountSheet.script";
import { CopyIcon, HeadIcon, OrderlyIcon, USDCIcon } from "./icons";

export const AccountSheet: FC<AccountSheetState> = (props) => {
  return (
    <Flex direction={"column"} gap={4}>
      <AccountInfo {...props} />
      <ReferralInfo {...props} />
      <TradingRewardsInfo {...props} />
      <Flex>
        <Button variant="outlined" color="danger" size="md" onClick={props.onDisconnect}>
            Disconnect
        </Button>
      </Flex>
    </Flex>
  );
};
export const AccountInfo: FC<AccountSheetState> = (props) => {
  return (
    <Flex width={"100%"} justify={"between"}>
      <Flex gap={3}>
        <HeadIcon />
        <Flex
          direction={"column"}
          justify={"start"}
          itemAlign={"start"}
          className="oui-gap-[2px]"
        >
          <Text.formatted rule={"address"}>{props.address}</Text.formatted>
          <Text.formatted
            size="2xs"
            intensity={80}
            // @ts-ignore
            prefix={
              <div className="oui-h-1 oui-w-1 oui-rounded-full oui-bg-success oui-pr-1" />
            }
          >
            {props.chainId}
          </Text.formatted>
        </Flex>
      </Flex>
      <button
        className="oui-cursor-pointer"
        onClick={() => {
          props.onCopyAddress();
        }}
      >
        <CopyIcon />
      </button>
    </Flex>
  );
};

export const ReferralInfo: FC<AccountSheetState> = (props) => {
  return (
    <Flex
      direction={"column"}
      gap={3}
      r="lg"
      p={3}
      className="oui-bg-base-6"
      width={"100%"}
    >
      <Flex justify={"between"} width={"100%"}>
        <Text>Referral</Text>
        <button onClick={props.onGotoAffliate} className="oui-cursor-pointer">
          <ArrowRightShortIcon color="white" opacity={0.98} />
        </button>
      </Flex>
      {props.isAffliate && (
        <Flex
          gradient="primary"
          p={4}
          r="lg"
          width={"100%"}
          angle={180}
          justify={"between"}
        >
          <Flex direction={"column"} itemAlign={"start"}>
            <Text size="xs">Affiliate</Text>
            <Text size="2xs" intensity={54}>
              (30d commission)
            </Text>
          </Flex>
          <Flex className="oui-gap-[6px]">
            <USDCIcon />
            <Text.numeral dp={2}>{props.affiliate}</Text.numeral>
          </Flex>
        </Flex>
      )}
      {props.isTrader && (
        <Flex
          gradient="success"
          p={4}
          r="lg"
          width={"100%"}
          angle={180}
          justify={"between"}
        >
          <Flex direction={"column"} itemAlign={"start"}>
            <Text size="xs">Trader</Text>
            <Text size="2xs" intensity={54}>
              (30d commission)
            </Text>
          </Flex>
          <Flex className="oui-gap-[6px]">
            <USDCIcon />
            <Text.numeral dp={2}>{props.trader}</Text.numeral>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export const TradingRewardsInfo: FC<AccountSheetState> = (props) => {
  return (
    <Flex
      direction={"column"}
      gap={3}
      r="lg"
      p={3}
      className="oui-bg-base-6"
      width={"100%"}
    >
      <Flex justify={"between"} width={"100%"}>
        <Text>{`Trading rewards (epoch ${props.curEpochId})`}</Text>
        <button
          onClick={props.onGotoTradingRewards}
          className="oui-cursor-pointer"
        >
          <ArrowRightShortIcon color="white" opacity={0.98} />
        </button>
      </Flex>
      <Flex
        p={4}
        r="lg"
        width={"100%"}
        angle={180}
        justify={"between"}
        className="oui-bg-gradient-to-t oui-from-[#2d0061] oui-to-[#bd6bed]"
      >
        <Text size="2xs" intensity={80}>
          My est. rewards
        </Text>

        <Flex className="oui-gap-[6px]">
          <OrderlyIcon />
          <Text.numeral dp={2}>{props.estRewards}</Text.numeral>
        </Flex>
      </Flex>
    </Flex>
  );
};
