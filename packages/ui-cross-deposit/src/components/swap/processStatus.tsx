import { FC, useMemo } from "react";
import {
  Box,
  Button,
  CheckedCircleFillIcon,
  CloseCircleFillIcon,
  cn,
  Divider,
  Flex,
  Spinner,
  Text,
} from "@orderly.network/ui";
import { TopRightArrowIcon } from "../../icons";
import { SwapMode, SwapProcessStatus } from "../../types";

type ProcessStatusProps = {
  status?: SwapProcessStatus;
  mode: SwapMode;
  statusUrl?: string;
  onComplete?: (isSuccss: boolean) => void;
  brokerName?: string;
};

type SwapState = "notStart" | "pending" | "failed" | "success";

type TProcessItem = {
  title: string;
  description: string;
  state: SwapState;
};

const getBridgeStatus = (status: SwapProcessStatus): SwapState => {
  if (status === SwapProcessStatus.Bridging) {
    return "pending";
  }
  if (status === SwapProcessStatus.BridgeFialed) {
    return "failed";
  }

  if (status === SwapProcessStatus.Done) {
    return "success";
  }

  return "notStart";
};

const getDepositStatus = (status: SwapProcessStatus): SwapState => {
  if (status === SwapProcessStatus.Depositing) {
    return "pending";
  }
  if (status === SwapProcessStatus.DepositFailed) {
    return "failed";
  }

  if (status === SwapProcessStatus.Done) {
    return "success";
  }

  return "notStart";
};

export const ProcessStatus: FC<ProcessStatusProps> = (props) => {
  const { status, mode, statusUrl, brokerName } = props;

  const items = useMemo(() => {
    const list: TProcessItem[] = [
      {
        title: "Bridging",
        description: "Bridge to Arbirtum via Stargate",
        state: getBridgeStatus(status!),
      },
      {
        title: "Deposit",
        description: `Deposit to ${brokerName}`,
        state: getDepositStatus(status!),
      },
    ];

    if (mode === SwapMode.Single) {
      return list.slice(1, 2);
    }

    return list;
  }, [mode, brokerName, status]);

  const onOk = () => {
    props.onComplete?.(status === SwapProcessStatus.Done);
  };

  const isFailed =
    status === SwapProcessStatus.DepositFailed ||
    status === SwapProcessStatus.BridgeFialed;

  const disabled =
    status === SwapProcessStatus.Bridging ||
    status === SwapProcessStatus.Depositing;

  return (
    <div className="oui-font-semibold">
      <Box intensity={600} p={4} r="lg">
        <Flex direction="column" itemAlign="start" gapY={4}>
          {items.map((item) => (
            <ProcessItem {...item} key={item.title} />
          ))}
        </Flex>

        <Box my={3}>
          <Divider intensity={8} />
        </Box>

        <Flex
          gapX={1}
          justify="center"
          itemAlign="center"
          className="oui-cursor-pointer"
          onClick={() => {
            window.open(statusUrl);
          }}
        >
          <Text size="2xs" color="primaryLight">
            View status
          </Text>
          <TopRightArrowIcon className="oui-text-primary-light" />
        </Flex>
      </Box>

      <Flex
        direction="column"
        justify="center"
        itemAlign="center"
        mt={8}
        gapY={3}
      >
        {isFailed && (
          <Text size="xs" className="oui-text-danger-light">
            Deposit failed, please try again later.
          </Text>
        )}

        <Button className="oui-w-[184px]" disabled={disabled} onClick={onOk}>
          OK
        </Button>
      </Flex>
    </div>
  );
};

const ProcessItem: FC<TProcessItem> = ({ title, description, state }) => {
  return (
    <Flex itemAlign="start" gapX={2} key={title}>
      <Flex width={20} height={20} justify="center">
        <StatusIndicator state={state} />
      </Flex>
      <Flex direction="column" itemAlign="start">
        <Text
          size="sm"
          className={cn(
            state === "pending" || state === "failed"
              ? "oui-text-base-contrast"
              : "oui-text-base-contrast-54"
          )}
        >
          {title}
        </Text>
        <Text
          size="2xs"
          className={cn(
            state === "pending"
              ? "oui-text-base-contrast-54"
              : "oui-text-base-contrast-20"
          )}
        >
          {description}
        </Text>
      </Flex>
    </Flex>
  );
};

const StatusIndicator: FC<{ state: SwapState }> = ({ state }) => {
  if (state === "pending") {
    return <Spinner size="sm" />;
  }

  if (state === "failed") {
    return (
      <CloseCircleFillIcon
        size={20}
        opacity={1}
        className="oui-text-danger-light"
      />
    );
  }

  if (state === "success") {
    return (
      <CheckedCircleFillIcon
        size={20}
        opacity={1}
        className="oui-text-primary-light"
      />
    );
  }

  return <Box r="full" width={10} height={10} intensity={200}></Box>;
};