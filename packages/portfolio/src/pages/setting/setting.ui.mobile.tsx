import { FC } from "react";
import { SettingScriptReturns } from "./setting.script";
import { Card, Flex, Switch, Text } from "@orderly.network/ui";
import { AuthGuardTooltip } from "@orderly.network/ui-connector";
import { useTranslation } from "@orderly.network/i18n";

export const SettingMobile: FC<SettingScriptReturns> = (props) => {
  const { t } = useTranslation();

  return <Card
    // @ts-ignore
    title={<div className="oui-text-sm">{t("portfolio.setting.systemUpgrade")}</div>}
    id="portfolio-apikey-manager"
    className="oui-bg-base-9 oui-font-semibold"
    classNames={{ root: "oui-p-4", content: '!oui-pt-3' }}
  >
    <Flex
      direction={"row"}
      gap={4}
      width={"100%"}
      itemAlign={"center"}
      pt={3}
      className="oui-font-semibold oui-border-t-2 oui-border-line-6"
    >
      <Flex direction={"column"} itemAlign={"start"} className="oui-flex-1 oui-gap-2">
        <Text intensity={80} size="xs">
          {t("portfolio.setting.cancelOpenOrders")}
        </Text>
        <Text intensity={36} size="2xs" className="oui-font-normal">
          {t("portfolio.setting.cancelOpenOrders.description")}
        </Text>
        <AuthGuardTooltip>
          <Switch
            className="oui-mt-1"
            checked={props.maintenance_cancel_orders}
            onCheckedChange={(e) => {
              props.setMaintainConfig(e);
            }}
            disabled={props.isSetting || !props.canTouch}
            data-testid="oui-testid-setting-switch-btn"
          />
        </AuthGuardTooltip>
      </Flex>
    </Flex>
  </Card>
};
