import { FC } from "react";
import { ArrowRightShortIcon, Button, Flex, Text } from "@orderly.network/ui";
import { AccountSheetState } from "./accountSheet.script";
import { CopyIcon, HeadIcon, OrderlyIcon, USDCIcon } from "./icons";
import { Decimal } from "@orderly.network/utils";

export const AccountSheet: FC<AccountSheetState> = (props) => {
  return (
    <Flex direction={"column"} gap={4}>
      <AccountInfo {...props} />
      <ReferralInfo {...props} />
      <TradingRewardsInfo {...props} />
      <Flex gap={3} width={"100%"} justify={"center"}>
        {props.showGetTestUSDC && (
          <Button
            variant="outlined"
            // color="primary"
            size="md"
            onClick={props.onGetTestUSDC}
            fullWidth
            loading={props.gettingTestUSDC}
            className="oui-border-primary-light oui-text-primary-light"
          >
            Get test USDC
          </Button>
        )}
        <Button
          variant="outlined"
          color="danger"
          size="md"
          onClick={props.onDisconnect}
          className={props.showGetTestUSDC ? "oui-w-full" : "oui-w-[50%]"}
        >
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
            {props.chainName}
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
      <button
        onClick={props.onClickReferral}
        className="oui-cursor-pointer oui-w-full"
      >
        <Flex justify={"between"} width={"100%"}>
          <Text size="2xs">Referral</Text>
          <ArrowRightShortIcon color="white" opacity={0.98} size={16} />
        </Flex>
      </button>
      {props.isAffiliate && (
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
            <Text.numeral
              dp={2}
              padding={false}
              rm={Decimal.ROUND_DOWN}
              rule="price"
            >
              {props.affiliateCommission30D ?? "--"}
            </Text.numeral>
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
            <Text.numeral
              dp={2}
              padding={false}
              rm={Decimal.ROUND_DOWN}
              rule="price"
            >
              {props.traderCommission30D ?? "--"}
            </Text.numeral>
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
      <button
        onClick={props.onClickTradingRewards}
        className="oui-cursor-pointer oui-w-full"
      >
        <Flex justify={"between"} width={"100%"}>
          <span className="oui-text-2xs">
          Trading rewards
          <Text intensity={54}>{" (epoch "}</Text>
          {props.curEpochId}
          <Text  intensity={54}>{" )"}</Text>
          </span>
          <ArrowRightShortIcon color="white" opacity={0.98}  size={16}/>
        </Flex>
      </button>
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
          <Text.numeral
            dp={2}
            padding={false}
            rm={Decimal.ROUND_DOWN}
            rule="price"
          >
            {props.estRewards}
          </Text.numeral>
        </Flex>
      </Flex>
    </Flex>
  );
};
