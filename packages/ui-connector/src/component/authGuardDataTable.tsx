import React, { PropsWithChildren, useMemo } from "react";
import { useAccount } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { useAppContext, useDataTap } from "@kodiak-finance/orderly-react-app";
import { AccountStatusEnum } from "@kodiak-finance/orderly-types";
import {
  ExtensionPositionEnum,
  ExtensionSlot,
  DataTable,
  DataTableProps,
} from "@kodiak-finance/orderly-ui";
import { Flex } from "@kodiak-finance/orderly-ui";
import { alertMessages, AuthGuard } from "./authGuard";

export const AuthGuardDataTable = <RecordType,>(
  props: PropsWithChildren<
    DataTableProps<RecordType> &
      Omit<GuardViewProps, "status"> & {
        status?: AccountStatusEnum;
        classNames?: DataTableProps<RecordType>["classNames"] & {
          authGuardDescription?: string;
        };
      }
  >,
) => {
  const {
    status,
    // message,
    labels,
    description,
    dataSource,
    children,
    ...rest
  } = props;
  const { state } = useAccount();
  const { wrongNetwork, disabledConnect } = useAppContext();

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

  const ignoreLoadingCheck =
    wrongNetwork ||
    disabledConnect ||
    state.status < _status ||
    props.ignoreLoadingCheck;

  return (
    <DataTable
      dataSource={data}
      ignoreLoadingCheck={ignoreLoadingCheck}
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
    >
      {children}
    </DataTable>
  );
};

type GuardViewProps = {
  status: AccountStatusEnum;
  description?: alertMessages;
  labels?: alertMessages;
  className?: string;
  visible?: boolean;
};

const GuardView: React.FC<GuardViewProps> = (props) => {
  const { t } = useTranslation();

  const DESCRIPTIONS: alertMessages = {
    connectWallet: t("connector.trade.connectWallet.tooltip"),
    switchChain: t("connector.wrongNetwork.tooltip"),
    enableTrading: t("connector.trade.enableTrading.tooltip"),
    signin: t("connector.trade.createAccount.tooltip"),
  };

  const descriptions = { ...DESCRIPTIONS, ...props.description };
  if (!props.visible) {
    return null;
  }
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
