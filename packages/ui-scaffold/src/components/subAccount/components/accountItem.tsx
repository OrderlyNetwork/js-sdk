import { useCallback, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { CopyIcon, formatAddress, toast, Tooltip } from "@orderly.network/ui";
import { cn, Flex, Text } from "@orderly.network/ui";
import { EditIcon } from "../icons";

interface AccountItemProps {
  isMainAccount?: boolean;
  accountId: string;
  description?: string;
  userAddress?: string;
  balance?: string;
  isCurrent?: boolean;
  onSwitch?: (accountId: string) => void;
  holdings?: { token: string; holding: number }[];
  onEdit?: (accountItem: { accountId: string; description: string }) => void;
}

const AccountIdForCopy = (props: { accountId: string }) => {
  const { t } = useTranslation();
  const info = useMemo(() => {
    return {
      leading: props.accountId.slice(0, 6),
      middle: props.accountId.slice(6, -4),
      trailing: props.accountId.slice(-4),
    };
  }, [props.accountId]);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(props.accountId);
    toast.success(t("common.copy"));
  }, [props.accountId]);
  return (
    <Flex
      className="oui-w-[180px] oui-min-h-[50px]"
      gap={2}
      justify="between"
      itemAlign="center"
    >
      <Text className="oui-text-2xs oui-w-full oui-break-all oui-text-base-contrast-36">
        <Text className="oui-text-base-contrast">{info.leading}</Text>
        <Text>{info.middle}</Text>
        <Text className="oui-text-base-contrast">{info.trailing}</Text>
      </Text>
      <CopyIcon
        onClick={copy}
        className="oui-cursor-pointer oui-text-base-contrast-36 hover:oui-text-base-contrast"
      />
    </Flex>
  );
};

export const AccountItem = (props: AccountItemProps) => {
  const holdings = useMemo(() => {
    if (!props.holdings || !props.holdings.length) {
      return [{ holding: 0, token: "USDC" }];
    }
    return props.holdings;
  }, [props.holdings]);
  return (
    <>
      <Flex
        justify="between"
        itemAlign="center"
        width="100%"
        className={cn(
          "oui-bg-base-6 oui-px-3 oui-py-4 oui-relative oui-rounded-[6px] oui-cursor-pointer",
          "oui-border oui-border-base-6",
          props.isCurrent && " oui-border-[#38E2FE] ",
          !props.isCurrent && "hover:oui-border-base-contrast-16",
        )}
      >
        <div
          className="oui-absolute oui-top-0 oui-right-0 oui-bottom-0 oui-left-0 oui-z-0 "
          onClick={() => {
            if (props.isCurrent) {
              return;
            }
            props.onSwitch?.(props.accountId);
          }}
        />
        {props.isCurrent && (
          <div
            className={cn(
              "oui-absolute -oui-top-[1px] -oui-right-[1px] oui-leading-3 oui-text-base-contrast-54",
              "oui-text-[10px] oui-font-semibold oui-text-black",
              "oui-pl-1 oui-pr-[5px] oui-py-0.5 oui-rounded-[6px] oui-rounded-tl-none oui-rounded-br-none  oui-bg-[#38E2FE]",
            )}
          >
            Current
          </div>
        )}
        <Flex
          key={props.accountId}
          direction="column"
          itemAlign="start"
          gap={1}
          className="oui-z-[2]"
        >
          {props.isMainAccount ? (
            <Text className="oui-text-xs oui-leading-3 oui-text-base-contrast">
              {formatAddress(props.userAddress ?? "")}
            </Text>
          ) : (
            <Flex
              justify="start"
              itemAlign="center"
              className="oui-gap-[2px] oui-cursor-pointer oui-fill-base-contrast-54 hover:oui-fill-base-contrast"
              onClick={(event) => {
                props.onEdit?.({
                  accountId: props.accountId,
                  description: props.description ?? "",
                });
                event.stopPropagation();
                event.preventDefault();
              }}
            >
              <Text className="oui-text-xs oui-leading-3 oui-text-base-contrast">
                {props.description}
              </Text>
              <EditIcon className="oui-fill-base-contrast-54 hover:oui-fill-base-contrast" />
            </Flex>
          )}
          <Tooltip content={<AccountIdForCopy accountId={props.accountId} />}>
            <Text className="oui-text-2xs oui-leading-3 oui-text-base-contrast-36 hover:oui-text-base-contrast">
              ID: {formatAddress(props.accountId)}
            </Text>
          </Tooltip>
        </Flex>
        <Flex>
          {holdings.map((holding) => (
            <Flex key={holding.token}>
              {holding.holding} {holding.token}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </>
  );
};
