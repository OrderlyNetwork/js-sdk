import { PropsWithChildren } from "react";
import {
  DataTableProps,
  ExtensionPositionEnum,
  ExtensionSlot,
  TableView,
  TableViewProps,
} from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
import { alertMessages, DESCRIPTIONS } from "../constants/message";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { Flex } from "@orderly.network/ui";
import { AuthGuard } from "./authGuard";
import { useAccount } from "@orderly.network/hooks";

export const AuthGuardTableView = <RecordType extends unknown>(
  props: PropsWithChildren<
    TableViewProps<RecordType> &
      Omit<GuardViewProps, "status"> & {
        status?: AccountStatusEnum;
        classNames?: DataTableProps<RecordType>["classNames"] & {
          authGuardDescription?: string;
        };
      }
  >
) => {
  const {
    status = AccountStatusEnum.EnableTrading,
    // message,
    labels,
    description,
    dataSource,
    ...rest
  } = props;
  const data = useDataTap(dataSource, {
    accountStatus: status,
  });
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();

  return (
    <TableView
      dataSource={data}
      ignoreLoadingCheck={
        wrongNetwork || state.status < status || props.ignoreLoadingCheck
      }
      emptyView={
        <GuardView
          status={status}
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
