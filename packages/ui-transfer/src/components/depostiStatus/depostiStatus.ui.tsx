import { FC, ReactNode, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AssetHistoryStatusEnum } from "@orderly.network/types";
import { Flex, cn, Text, ChevronRightIcon } from "@orderly.network/ui";
import { DepositStatusScriptReturn } from "./depostiStatus.script";

export type DepositStatusProps = {
  className?: string;
  classNames?: {
    root?: string;
    items?: string;
  };
  onClick?: () => void;
} & DepositStatusScriptReturn;

export const DepositStatus = (props: DepositStatusProps) => {
  const { isSignIn, classNames } = props;

  if (!isSignIn) {
    return null;
  }

  return (
    <Flex
      direction="column"
      gapY={1}
      width="100%"
      className={cn(props.className, classNames?.root)}
    >
      <DepositStatusContent
        count={props.pendingCount}
        status={AssetHistoryStatusEnum.PENDING}
        onClick={props.onClick}
        className={classNames?.items}
      />
      <DepositStatusContent
        count={props.completedCount}
        status={AssetHistoryStatusEnum.COMPLETED}
        onClick={props.onClick}
        className={classNames?.items}
      />
    </Flex>
  );
};

type DepositStatusContentProps = {
  count: number;
  status: AssetHistoryStatusEnum.PENDING | AssetHistoryStatusEnum.COMPLETED;
  onClick?: () => void;
  className?: string;
};

export const DepositStatusContent = (props: DepositStatusContentProps) => {
  const { t } = useTranslation();
  const { count, status } = props;

  const content = useMemo(() => {
    if (status === AssetHistoryStatusEnum.PENDING) {
      return count > 1
        ? t("transfer.deposit.status.pending.multiple")
        : t("transfer.deposit.status.pending.one");
    }

    return count > 1
      ? t("transfer.deposit.status.completed.multiple")
      : t("transfer.deposit.status.completed.one");
  }, [t, status, count]);

  if (count === 0) {
    return null;
  }

  const clickable = typeof props.onClick === "function";

  return (
    <Flex
      justify="between"
      itemAlign="center"
      intensity={900}
      className={cn(
        "oui-font-normal",
        "oui-px-3 lg:oui-px-0",
        "oui-py-2 lg:oui-py-0",
        clickable && "oui-cursor-pointer",
        props.className,
      )}
      width="100%"
      r="full"
      onClick={props.onClick}
    >
      <Flex gapX={1} width="100%">
        <Dot
          className={
            status === AssetHistoryStatusEnum.COMPLETED
              ? "oui-bg-success"
              : "oui-bg-primary"
          }
        />
        <Text size="2xs" intensity={80}>
          {content}
        </Text>
      </Flex>
      <Flex gapX={1}>
        <Badge>{props.count}</Badge>
        {clickable && (
          <ChevronRightIcon
            size={14}
            opacity={1}
            className="oui-text-base-contrast-54"
          />
        )}
      </Flex>
    </Flex>
  );
};

const Badge: FC<{ className?: string; children: ReactNode }> = (props) => {
  return (
    <Flex
      justify="center"
      itemAlign="center"
      r="full"
      width={18}
      height={18}
      className={cn("oui-bg-line-12", props.className)}
    >
      <Text size="3xs" intensity={80}>
        {props.children}
      </Text>
    </Flex>
  );
};

const Dot: FC<{ className?: string }> = (props) => {
  return (
    <div
      className={cn(
        "oui-mx-[5px] oui-size-2 oui-shrink-0 oui-rounded-full",
        props.className,
      )}
    />
  );
};
