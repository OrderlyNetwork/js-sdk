import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  cn,
  TokenIcon,
  Text,
  formatAddress,
  DataFilter,
  modal,
} from "@orderly.network/ui";
import { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import { useAssetsScriptReturn } from "./assets.script";
import { AccountType } from "./assets.ui";

export const AssetsTableMobile = (props: useAssetsScriptReturn) => {
  console.log(props);
  const { t } = useTranslation();

  const subAccounts = props.state.subAccounts ?? [];

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
    if (!Array.isArray(props.holding) || props.holding.length === 0) {
      return [ALL_ASSETS];
    }

    // Extract unique tokens from stable holding data only
    const uniqueTokens = [
      ...new Set(
        props.holding
          .filter((item) => item.token) // Filter out items without token
          .map((item) => item.token), // Extract token names
      ),
    ];

    // Create options array
    const assetOptions = uniqueTokens.map((token) => ({
      value: token,
      label: token,
    }));

    return [ALL_ASSETS, ...assetOptions];
  }, [props.holding]);

  return (
    <div className="oui-flex oui-flex-col oui-gap-1 oui-px-3 oui-pb-4">
      <div>
        {props.isMainAccount && (
          <DataFilter
            onFilter={props.onFilter}
            className="oui-border-none oui-py-2"
            items={[
              {
                size: "sm",
                type: "picker",
                name: "account",
                value: props.selectedAccount,
                options: memoizedOptions,
              },
              {
                size: "sm",
                type: "picker",
                name: "asset",
                value: props.selectedAsset,
                options: memoizedAssets,
              },
            ]}
          />
        )}
      </div>
      <div className="oui-flex oui-flex-col oui-gap-1">
        {props.dataSource.map((assets) => (
          <>
            <AccountTag name={assets.description ?? "sub account"} />
            {assets.children.map((child: any) => (
              <AssetMobileItem
                item={child}
                key={`${child.token}-${child.account_id}`}
              />
            ))}
          </>
        ))}
      </div>
    </div>
  );
};

type AssetMobileItemProps = {
  item: any;
};

const AssetMobileItem: FC<AssetMobileItemProps> = ({ item }) => {
  const { t } = useTranslation();

  return (
    <div className="oui-flex oui-flex-col oui-gap-3 oui-rounded-xl oui-bg-base-9 oui-p-4">
      <div className="oui-flex oui-items-center oui-justify-between">
        <div className="oui-flex oui-flex-col">
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
            {t("common.token")}
          </div>
          <div className="oui-flex oui-items-center oui-gap-1 oui-text-xs oui-font-semibold oui-text-base-contrast-80">
            <TokenIcon name={item.token} className="oui-size-4" /> {item.token}
          </div>
        </div>
        <div className="oui-flex oui-flex-col">
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
            {t("common.quantity")}
          </div>
          <div>
            <Text.numeral dp={2}>{item.holding}</Text.numeral>
          </div>
        </div>
        <div className="oui-flex oui-flex-col">
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
            {"Collateral contribution"}
          </div>
          <div className="oui-flex oui-items-center oui-gap-1 oui-self-end oui-text-xs oui-font-semibold oui-text-base-contrast-80">
            <Text.numeral dp={2}>{item.collateralContribution}</Text.numeral>
            <div className="oui-text-base-contrast-36">USDC</div>
          </div>
        </div>
      </div>
      <div className="oui-flex oui-gap-2">
        <Button
          variant="outlined"
          size="sm"
          color="gray"
          onClick={() => modal.show("ConvertDialogId")}
          disabled={item.token === "USDC"}
          className={cn(
            "oui-flex-1 oui-border-white/[0.36] oui-text-base-contrast-54",
          )}
        >
          Convert
        </Button>
        <Button
          variant="outlined"
          size="sm"
          color="gray"
          className={cn(
            "oui-flex-1 oui-border-white/[0.36] oui-text-base-contrast-54",
          )}
        >
          {t("common.transfer")}
        </Button>
      </div>
    </div>
  );
};

const AccountTag: FC<{ name: string }> = ({ name }) => {
  return (
    <div className="oui-mt-2 oui-flex oui-h-[18px] oui-w-fit oui-items-center oui-rounded oui-bg-white/[0.06] oui-px-2 oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
      {name}
    </div>
  );
};
