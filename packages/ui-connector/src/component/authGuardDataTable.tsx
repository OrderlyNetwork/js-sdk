import { PropsWithChildren, useMemo } from "react";
import {
  ExtensionPositionEnum,
  ExtensionSlot,
  DataTable,
  DataTableProps,
} from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
import { alertMessages, DESCRIPTIONS } from "../constants/message";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { Flex } from "@orderly.network/ui";
import { AuthGuard } from "./authGuard";
import { useAccount } from "@orderly.network/hooks";

export const AuthGuardDataTable = <RecordType extends unknown>(
  props: PropsWithChildren<
    DataTableProps<RecordType> &
      Omit<GuardViewProps, "status"> & {
        status?: AccountStatusEnum;
        classNames?: DataTableProps<RecordType>["classNames"] & {
          authGuardDescription?: string;
        };
      }
  >
) => {
  const {
    status,
    // message,
    labels,
    description,
    dataSource,
    ...rest
  } = props;
  const { state } = useAccount();

  const _status = useMemo(() => {
    if (status === undefined) {
      return state.status === AccountStatusEnum.EnableTradingWithoutConnected
        ? AccountStatusEnum.EnableTradingWithoutConnected
        : AccountStatusEnum.EnableTrading;
    }
    return status;
  }, [status, state.status]);

  const data = useDataTap(dataSource, {
    accountStatus: _status,
  });
  const { wrongNetwork } = useAppContext();

  return (
    <DataTable
      dataSource={data}
      ignoreLoadingCheck={
        wrongNetwork || state.status < _status || props.ignoreLoadingCheck
      }
      emptyView={
        <GuardView
          status={_status}
          description={description}
          labels={labels}
          className={props.classNames?.authGuardDescription}
          visible={!state.validating}
        />
      }
      manualPagination
      {...rest}
    />
  );
};

type GuardViewProps = {
  status: AccountStatusEnum;
  description?: alertMessages;
  labels?: alertMessages;
  className?: string;
  visible?: boolean;
};

const GuardView = (props: GuardViewProps) => {
  const descriptions = { ...DESCRIPTIONS, ...props.description };
  if (!props.visible) return null;
  return (
    <Flex py={8}>
      <AuthGuard
        status={props.status}
        labels={props.labels}
        descriptions={descriptions}
        buttonProps={{
          size: "md",
        }}
      >
        <ExtensionSlot position={ExtensionPositionEnum.EmptyDataIdentifier} />
      </AuthGuard>
    </Flex>
  );
};
