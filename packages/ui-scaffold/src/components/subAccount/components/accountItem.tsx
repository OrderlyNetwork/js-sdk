import { useCallback, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  cn,
  CopyIcon,
  Flex,
  formatAddress,
  Text,
  toast,
  Tooltip,
  useScreen,
} from "@orderly.network/ui";
import { EditIcon } from "../icons";

interface AccountItemProps {
  isMainAccount?: boolean;
  accountId: string;
  description?: string;
  userAddress?: string;
  balance?: string;
  isCurrent?: boolean;
  onSwitch?: (accountId: string) => void;
  accountValue?: number;
  onEdit?: (accountItem: { accountId: string; description: string }) => void;
}

function splitAccountIdForDisplay(accountId: string) {
  return {
    leading: accountId.slice(0, 6),
    middle: accountId.slice(6, -4),
    trailing: accountId.slice(-4),
  };
}

interface AccountIdForCopyProps {
  accountId: string;
  onCopy: (event: MouseEvent) => void;
}

const AccountIdForCopy = (props: AccountIdForCopyProps) => {
  const info = splitAccountIdForDisplay(props.accountId);
  return (
    <Flex
      className="oui-min-h-[50px] oui-w-[180px]"
      gap={2}
      justify="between"
      itemAlign="center"
    >
      <Text className="oui-w-full oui-break-all oui-text-2xs oui-text-base-contrast-36">
        <Text className="oui-text-base-contrast">{info.leading}</Text>
        <Text>{info.middle}</Text>
        <Text className="oui-text-base-contrast">{info.trailing}</Text>
      </Text>
      <CopyIcon
        onClick={props.onCopy}
        className="oui-cursor-pointer oui-text-base-contrast-36 hover:oui-text-base-contrast"
      />
    </Flex>
  );
};

export const AccountItem = (props: AccountItemProps) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const descriptionRef = useRef<HTMLSpanElement>(null);
  const [descriptionTooltipOpen, setDescriptionTooltipOpen] = useState(false);

  const onDescriptionTooltipOpenChange = useCallback((open: boolean) => {
    const element = descriptionRef.current;
    setDescriptionTooltipOpen(
      open && !!element && element.scrollWidth > element.clientWidth,
    );
  }, []);

  const {
    isMainAccount,
    accountId,
    description,
    userAddress,
    isCurrent,
    onSwitch,
    accountValue,
    onEdit,
  } = props;

  const copyAccountId = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      navigator.clipboard.writeText(accountId);
      toast.success(t("common.copy.copied"));
    },
    [accountId, t],
  );

  const handleSwitch = useCallback(() => {
    if (isCurrent) return;
    onSwitch?.(accountId);
  }, [isCurrent, onSwitch, accountId]);

  const handleEdit = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      onEdit?.({
        accountId,
        description: description ?? "",
      });
    },
    [onEdit, accountId, description],
  );

  const stopPropagation = useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <Flex
      justify="between"
      itemAlign="center"
      width="100%"
      onClick={handleSwitch}
      className={cn(
        "oui-relative oui-cursor-pointer oui-gap-3 oui-rounded-[6px] oui-bg-base-6 oui-px-3 oui-py-4",
        "oui-border oui-border-base-6",
        isCurrent && "oui-border-[rgb(var(--oui-gradient-brand-start))]",
        !isCurrent && "hover:oui-border-base-contrast-16",
      )}
    >
      {isCurrent && (
        <div
          className={cn(
            "oui-absolute -oui-end-[1px] -oui-top-[1px] oui-leading-3",
            "oui-text-[10px] oui-font-semibold oui-text-base-10",
            "oui-rounded-[6px] oui-rounded-ee-none oui-rounded-ss-none oui-bg-[rgb(var(--oui-gradient-brand-start))] oui-py-0.5 oui-ps-1 oui-pe-[5px]",
          )}
        >
          {t("subAccount.modal.current")}
        </div>
      )}
      <Flex
        direction="column"
        itemAlign="start"
        gap={1}
        className="oui-z-[2] oui-min-w-0 oui-flex-1"
      >
        {isMainAccount ? (
          <Text className="oui-text-xs oui-leading-3 oui-text-base-contrast">
            {formatAddress(userAddress ?? "")}
          </Text>
        ) : (
          <Flex
            justify="start"
            itemAlign="center"
            className="oui-max-w-full oui-cursor-pointer oui-gap-[2px] oui-fill-base-contrast-54 hover:oui-fill-base-contrast"
            onClick={handleEdit}
          >
            <Tooltip
              open={descriptionTooltipOpen}
              onOpenChange={onDescriptionTooltipOpenChange}
              onClick={stopPropagation}
              content={
                <Text className="oui-block oui-max-w-[180px] oui-break-all oui-text-2xs oui-text-base-contrast">
                  {description}
                </Text>
              }
            >
              <Text
                ref={descriptionRef}
                className="oui-min-w-0 oui-truncate oui-text-xs oui-leading-3 oui-text-base-contrast"
              >
                {description}
              </Text>
            </Tooltip>
            <EditIcon className="oui-shrink-0 oui-fill-base-contrast-54 hover:oui-fill-base-contrast" />
          </Flex>
        )}
        {isMobile ? (
          <Flex
            justify="start"
            itemAlign="center"
            gap={1}
            className="oui-w-full"
            onClick={stopPropagation}
          >
            <Text className="oui-min-w-0 oui-truncate oui-text-2xs oui-leading-3 oui-text-base-contrast-36">
              ID: {formatAddress(accountId)}
            </Text>
            <CopyIcon
              size={12}
              onClick={copyAccountId}
              className="oui-shrink-0 oui-cursor-pointer oui-text-base-contrast-36 hover:oui-text-base-contrast"
            />
          </Flex>
        ) : (
          <Tooltip
            onClick={stopPropagation}
            content={
              <AccountIdForCopy accountId={accountId} onCopy={copyAccountId} />
            }
          >
            <Text
              onClick={stopPropagation}
              className="oui-max-w-full oui-truncate oui-text-2xs oui-leading-3 oui-text-base-contrast-36 hover:oui-text-base-contrast"
            >
              ID: {formatAddress(accountId)}
            </Text>
          </Tooltip>
        )}
      </Flex>
      <Flex
        className="oui-shrink-0 oui-whitespace-nowrap oui-text-xs oui-text-base-contrast"
        itemAlign="end"
        gap={1}
      >
        <Text.numeral rule="price" dp={2}>
          {accountValue ?? 0}
        </Text.numeral>
        <Text>USDC</Text>
      </Flex>
    </Flex>
  );
};
