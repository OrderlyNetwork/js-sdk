import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Card, Flex, Switch, Text } from "@orderly.network/ui";
import { AuthGuardTooltip } from "@orderly.network/ui-connector";
import type { SettingScriptReturns } from "../setting.script";

type OrderNotificationsSettingCardProps = Pick<
  SettingScriptReturns,
  | "canTouch"
  | "showOrderNotifications"
  | "orderNotificationsEnabled"
  | "setOrderNotificationsEnabled"
> & { mobile?: boolean };

export const OrderNotificationsSettingCard: FC<
  OrderNotificationsSettingCardProps
> = (props) => {
  const { t } = useTranslation();
  if (!props.showOrderNotifications) return null;

  const title = t("portfolio.setting.orderNotifications");
  return (
    <Card
      title={props.mobile ? <div className="oui-text-sm">{title}</div> : title}
      id="portfolio-order-notifications-setting"
      className="oui-mt-2 oui-bg-base-9 oui-font-semibold md:oui-mt-3"
      classNames={
        props.mobile ? { root: "oui-p-4", content: "!oui-pt-3" } : undefined
      }
    >
      <Flex
        direction={props.mobile ? "column" : "row"}
        itemAlign={props.mobile ? "start" : "center"}
        width="100%"
        gap={props.mobile ? 2 : 4}
        pt={props.mobile ? 3 : 4}
        className="oui-border-t-2 oui-border-line-6"
      >
        <Text
          intensity={54}
          size={props.mobile ? "2xs" : "sm"}
          className="oui-flex-1"
        >
          {t("portfolio.setting.orderNotifications.description")}
        </Text>
        <AuthGuardTooltip align={props.mobile ? undefined : "end"}>
          <Switch
            aria-label={title}
            checked={props.orderNotificationsEnabled}
            onCheckedChange={props.setOrderNotificationsEnabled}
            disabled={!props.canTouch}
          />
        </AuthGuardTooltip>
      </Flex>
    </Card>
  );
};
