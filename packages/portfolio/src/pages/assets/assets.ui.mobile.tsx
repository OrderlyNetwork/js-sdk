import React, { useMemo } from "react";
import { useWalletConnector } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { ChainNamespace } from "@orderly.network/types";
import {
  Button,
  cn,
  TokenIcon,
  Text,
  formatAddress,
  DataFilter,
  modal,
  Flex,
} from "@orderly.network/ui";
import { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import type { useAssetsScriptReturn } from "./assets.script";
import { AccountType } from "./assets.ui";

const AccountTag: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="oui-mt-2 oui-flex oui-h-[18px] oui-w-fit oui-items-center oui-rounded oui-bg-white/[0.06] oui-px-2 oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
      {name}
    </div>
  );
};

type AssetMobileItemProps = {
  item: any;
};

const AssetMobileItem: React.FC<AssetMobileItemProps> = (props) => {
  const { t } = useTranslation();
  const { item } = props;
  const { namespace } = useWalletConnector();
  return (
    <div className="oui-flex oui-flex-col oui-gap-3 oui-rounded-xl oui-bg-base-9 oui-p-4">
      <Flex justify={"between"} itemAlign={"center"}>
        <div className="oui-flex oui-flex-col">
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
            {t("common.token")}
          </div>
          <div className="oui-flex oui-items-center oui-gap-1 oui-text-xs oui-font-semibold oui-text-base-contrast-80">
            <TokenIcon name={item.token} className="oui-size-4" />
            {item.token}
          </div>
        </div>
        <div className="oui-flex oui-flex-col">
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
            {t("common.quantity")}
          </div>
          <div>
            <Text.numeral dp={6} padding={false}>
              {item.holding}
            </Text.numeral>
          </div>
        </div>
        <div className="oui-flex oui-flex-col">
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
            {t("transfer.deposit.collateralContribution")}
          </div>
          <div className="oui-flex oui-items-center oui-gap-1 oui-self-end oui-text-xs oui-font-semibold oui-text-base-contrast-80">
            <Text.numeral dp={6} padding={false}>
              {item.collateralContribution}
            </Text.numeral>
            <div className="oui-text-base-contrast-36">USDC</div>
          </div>
        </div>
      </Flex>
      <Flex justify={"between"} itemAlign={"center"} gap={2}>
        {item.token !== "USDC" && namespace !== ChainNamespace.solana && (
          <Button
            fullWidth
            variant="outlined"
            size="sm"
            color="gray"
            onClick={() => {
              modal.show("ConvertSheetId", {
                accountId: item.account_id,
                token: item.token,
              });
            }}
            className={cn(
              "oui-flex-1 oui-border-white/[0.36] oui-text-base-contrast-54",
            )}
          >
            {t("transfer.convert")}
          </Button>
        )}
        <Button
          fullWidth
          variant="outlined"
          size="sm"
          color="gray"
          onClick={() => {
            modal.show("TransferSheetId", {
              accountId: item.account_id,
              token: item.token,
            });
          }}
          className={cn(
            "oui-flex-1 oui-border-white/[0.36] oui-text-base-contrast-54",
          )}
        >
          {t("common.transfer")}
        </Button>
      </Flex>
    </div>
  );
};

export const AssetsTableMobile: React.FC<useAssetsScriptReturn> = (props) => {
  const { t } = useTranslation();

  const {
    assetsOptions,
    state,
    isMainAccount,
    dataSource,
    selectedAccount,
    selectedAsset,
    onFilter,
  } = props;

  const subAccounts = state.subAccounts ?? [];

  const ALL_ACCOUNTS: SelectOption = {
    label: t("common.allAccount"),
    value: AccountType.ALL,
  };

  const MAIN_ACCOUNT: SelectOption = {
    label: t("common.mainAccount"),
    value: AccountType.MAIN,
  };

  const ALL_ASSETS: SelectOption = {
    label: "All assets",
    value: "all",
  };

  const memoizedOptions = useMemo(() => {
    if (Array.isArray(subAccounts) && subAccounts.length) {
      return [
        ALL_ACCOUNTS,
        MAIN_ACCOUNT,
        ...subAccounts.map<SelectOption>((value) => ({
          value: value.id,
          label: value?.description || formatAddress(value?.id),
        })),
      ];
    }
    return [ALL_ACCOUNTS, MAIN_ACCOUNT];
  }, [subAccounts]);

  // Create asset options from holding data - optimized and consistent with desktop
  const memoizedAssets = useMemo(() => {
    return [ALL_ASSETS, ...assetsOptions];
  }, [assetsOptions]);

  return (
    <div className="oui-flex oui-flex-col oui-gap-1 oui-px-3 oui-pb-4">
      <div>
        {isMainAccount && (
          <DataFilter
            onFilter={onFilter}
            className="oui-border-none oui-py-2"
            items={[
              {
                size: "sm",
                type: "picker",
                name: "account",
                value: selectedAccount,
                options: memoizedOptions,
              },
              {
                size: "sm",
                type: "picker",
                name: "asset",
                value: selectedAsset,
                options: memoizedAssets,
              },
            ]}
          />
        )}
      </div>
      <div className="oui-flex oui-flex-col oui-gap-1">
        {dataSource.map((assets, index) => (
          <React.Fragment key={`item-${index}`}>
            <AccountTag name={assets.description ?? "sub account"} />
            {assets.children.map((child) => (
              <AssetMobileItem
                item={child}
                key={`${child.token}-${child.account_id}`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
