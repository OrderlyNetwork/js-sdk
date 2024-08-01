import { PropsWithChildren } from "react";
import { DataTable, DataTableProps, ExtensionSlot } from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
import { alertMessages, DESCRIPTIONS } from "../constants/message";
import { useDataTap } from "@orderly.network/react-app";
import { Flex } from "@orderly.network/ui";
import { AuthGuard } from "./authGuard";

export const AuthGuardDataTable = <RecordType extends unknown>(
  props: PropsWithChildren<
    DataTableProps<RecordType> &
      GuardViewProps & {
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
  const data = useDataTap(dataSource);
  return (
    <DataTable
      {...rest}
      dataSource={data}
      emptyView={
        <GuardView
          status={status}
          description={description}
          labels={labels}
          className={props.classNames?.authGuardDescription}
        />
      }
    />
  );
};

type GuardViewProps = {
  status: AccountStatusEnum;
  description: alertMessages;
  labels: alertMessages;
  className?: string;
};

const GuardView = (props: GuardViewProps) => {
  const descriptions = { ...DESCRIPTIONS, ...props.description };
  return (
    <Flex>
      <AuthGuard
        status={props.status}
        labels={props.labels}
        descriptions={descriptions}
      >
        <ExtensionSlot position={"emptyDataState"} />
      </AuthGuard>
    </Flex>
  );
};
