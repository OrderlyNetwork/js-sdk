import {
  ArrowLeftRightIcon,
  Button,
  Card,
  DataTable,
  Divider,
  EmptyDataState,
  Flex,
  PlusIcon,
  Switch,
  Text,
} from "@orderly.network/ui";

import { SettingScriptReturns } from "./setting.script";
import { FC, useState } from "react";
import { Column } from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
import { AuthGuard, AuthGuardEmpty, AuthGuardTooltip } from "@orderly.network/ui-connector";
import { APIKeyItem } from "@orderly.network/hooks";

export const Setting: FC<SettingScriptReturns> = (props) => {
  return (
    <Card
      title={"API keys"}
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
          />{" "}
        </AuthGuardTooltip>
      </Flex>
    </Card>
  );
};
