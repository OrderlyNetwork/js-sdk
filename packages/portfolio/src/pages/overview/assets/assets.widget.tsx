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

type Props = {
  connected?: boolean;
  onConnectWallet?: () => void;
  onWithdraw?: () => void;
  onDeposit?: () => void;
  onLeverageEdit?: () => void;
};

export const AssetsWidget = (props: Props) => {
  return (
    <Card
      title={
        <AssetsHeader
          disabled={!props.connected}
          onDeposit={props.onDeposit}
          onWithdraw={props.onWithdraw}
        />
      }
      footer={
        <Either
          value={props.connected ?? false}
          left={<NotConnected onConnectWallet={props.onConnectWallet} />}
        >
          <Grid cols={3}>
            <Statistic
              label="Unreal. PnL"
              valueProps={{
                coloring: true,
                showIdentifier: true,
              }}
            >
              2312
            </Statistic>
            <Statistic label="Max account leverage">
              <Flex itemAlign={"center"}>
                <span>10</span>
                <span>x</span>
                <button
                  className="oui-ml-1"
                  onClick={() => props.onLeverageEdit?.()}
                >
                  <EditIcon color={"white"} size={18} />
                </button>
              </Flex>
            </Statistic>
            <Statistic label="Available to withdraw" align="right">
              2312
            </Statistic>
          </Grid>
        </Either>
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
            123424.22
          </Text.numeral>
        </Either>
      </Statistic>
      <Divider className="oui-mt-4" intensity={3} />
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
