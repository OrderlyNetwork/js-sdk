import { FC } from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Either,
  Statistic,
  Text,
  EyeIcon,
  gradientTextVariants,
  EditIcon,
} from "@orderly.network/ui";
import { AssetsHeader } from "./assetsHeader";
import { AuthGuard } from "@orderly.network/ui-connector";

type Props = {
  connected?: boolean;
  onConnectWallet?: () => void;
  onWithdraw?: () => void;
  onDeposit?: () => void;
  onLeverageEdit?: () => void;
  portfolioValue: number;
} & StatisticProps;

type StatisticProps = {
  currentLeverage: number;
  unrealPnL: number;
  unrealROI: number;
  freeCollateral: number;
};

export const AssetsUI = (props: Props) => {
  return (
    <Card
      title={
        <AssetsHeader
          disabled={!props.connected}
          onDeposit={props.onDeposit}
          onWithdraw={props.onWithdraw}
        />
      }
      // footer={
      //   <Either
      //     value={props.connected ?? false}
      //     left={<NotConnected onConnectWallet={props.onConnectWallet} />}
      //   >
      //     <AssetStatistic
      //       unrealROI={props.unrealROI}
      //       unrealPnL={props.unrealPnL}
      //       freeCollateral={props.freeCollateral}
      //       currentLeverage={props.currentLeverage}
      //     />
      //   </Either>
      // }
      footer={
        <AuthGuard>
          <AssetStatistic
            unrealROI={props.unrealROI}
            unrealPnL={props.unrealPnL}
            freeCollateral={props.freeCollateral}
            currentLeverage={props.currentLeverage}
          />
        </AuthGuard>
      }
    >
      <Statistic
        label={
          <Flex gap={1}>
            <Text intensity={54}>Portfolio value</Text>
            <button>
              <EyeIcon size={16} color={"white"} />
            </button>
          </Flex>
        }
      >
        <Either value={props.connected ?? false} left={<NoValue />}>
          <Text.numeral
            unit="USDC"
            style={{ "--oui-gradient-angle": "45deg" }}
            unitClassName="oui-text-base oui-text-base-contrast-80 oui-h-9"
            className={gradientTextVariants({
              className: "oui-font-bold oui-text-3xl",
              color: "brand",
            })}
          >
            {props.portfolioValue}
          </Text.numeral>
        </Either>
      </Statistic>
      <Divider className="oui-mt-4" intensity={8} />
    </Card>
  );
};

const NoValue: FC = () => {
  return (
    <Flex gap={1} className={"oui-h-9"}>
      <Text.gradient color="brand" weight="bold">
        --
      </Text.gradient>
      <Text>USDC</Text>
    </Flex>
  );
};

const NotConnected: FC<{
  onConnectWallet?: () => void;
}> = (props) => {
  return (
    <Box>
      <Button
        onClick={() => props.onConnectWallet?.()}
        variant={"gradient"}
        fullWidth
        angle={45}
      >
        Connect wallet
      </Button>
    </Box>
  );
};

export const AssetStatistic = (props: StatisticProps) => {
  return (
    <Grid cols={3}>
      <Statistic label="Unreal. PnL">
        <Flex>
          <Text.numeral coloring size="lg" weight="semibold">
            {props.unrealPnL}
          </Text.numeral>
          <Text.numeral
            coloring
            rule="percentages"
            size="sm"
            weight="semibold"
            prefix={"("}
            surfix=")"
          >
            {props.unrealROI}
          </Text.numeral>
        </Flex>
      </Statistic>
      <Statistic label="Max account leverage">
        <Flex itemAlign={"center"}>
          <span className="oui-text-lg">{props.currentLeverage}</span>
          <span>x</span>
          <button className="oui-ml-1" onClick={() => props.onLeverageEdit?.()}>
            <EditIcon color={"white"} size={18} />
          </button>
        </Flex>
      </Statistic>
      <Statistic
        label="Available to withdraw"
        align="right"
        valueProps={{ size: "lg" }}
      >
        {props.freeCollateral}
      </Statistic>
    </Grid>
  );
};
