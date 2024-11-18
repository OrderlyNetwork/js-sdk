import { FC } from "react";
import { Card, Flex, Switch, Text } from "@orderly.network/ui";
import { SettingScriptReturns } from "./setting.script";
import { AuthGuardTooltip } from "@orderly.network/ui-connector";

export const Setting: FC<SettingScriptReturns> = (props) => {
  return (
    <Card
      title={"System upgrade"}
      id="portfolio-apikey-manager"
      className="oui-bg-base-9 oui-font-semibold"
    >
      <Flex
        direction={"row"}
        gap={4}
        width={"100%"}
        itemAlign={"center"}
        pt={4}
        className="oui-font-semibold oui-border-t-2 oui-border-line-6"
      >
        <Flex direction={"column"} itemAlign={"start"} className="oui-flex-1">
          <Text intensity={80} size="base">
            Cancel open orders during system upgrade
          </Text>
          <Text intensity={54} size="sm">
            During the upgrade period, all open orders will be cancelled to
            manage your risk in case of high market volatility.
          </Text>
        </Flex>

        <AuthGuardTooltip align="end">
          <Switch
            checked={props.maintenance_cancel_orders}
            onCheckedChange={(e) => {
              props.setMaintainConfig(e);
            }}
            disabled={props.isSetting || !props.canTouch}
            data-testid="oui-testid-setting-switch-btn"
          />{" "}
        </AuthGuardTooltip>
      </Flex>
    </Card>
  );
};
