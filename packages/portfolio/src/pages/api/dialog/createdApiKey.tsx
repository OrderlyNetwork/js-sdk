import React, { FC, useEffect, useState } from "react";
import {
  Checkbox,
  Flex,
  SimpleDialog,
  Statistic,
  Text,
  TextField,
} from "@orderly.network/ui";
import { ApiManagerScriptReturns } from "../apiManager.script";

export const CreatedAPIKeyDialog: FC<ApiManagerScriptReturns> = (props) => {
  return (
    <SimpleDialog
      size="sm"
      open={props.showCreatedDialog}
      onOpenChange={(open) => {
        props.hideCreatedDialog?.();
      }}
      title="API key created"
      actions={{
        primary: {
          label: "OK",
          className:
            "oui-w-[120px] lg:oui-w-[154px] oui-bg-base-2 hover:oui-bg-base-3",
          size: "md",
          onClick: async () => {
            return props.doConfirm();
          },
        },
        secondary: {
          label: "Copy API info",
          className:
            "oui-w-[120px] lg:oui-w-[154px] oui-bg-primary hover:oui-opacity-80",
          size: "md",
          onClick: async () => {
            return props.onCopyApiKeyInfo();
          },
        },
      }}
      classNames={{
        footer: "oui-justify-center",
        content:
          "oui-bg-base-8 oui-w-[300px] lg:oui-w-[360px] oui-font-semibold",
        body: "oui-py-0 oui-pt-5",
      }}
    >
      <Flex direction={"column"} gap={4} itemAlign={"start"}>
        <Statistic label="API key">
          <Text.formatted
            size="sm"
            intensity={80}
            copyable
            copyIconSize={16}
            className="oui-break-all"
            onCopy={() => props.onCopyApiKey(props.generateKey?.key)}
          >
            {props.generateKey?.key}
          </Text.formatted>
        </Statistic>
        <Statistic label="Secret key">
          <Text.formatted
            size="sm"
            intensity={80}
            copyable
            copyIconSize={16}
            className="oui-break-all"
            onCopy={props.onCopyApiSecretKey}
          >
            {props.generateKey?.screctKey}
          </Text.formatted>{" "}
        </Statistic>
        <Statistic label="IP">
          <Text.formatted
            size="sm"
            intensity={80}
            copyable={(props.generateKey?.ip?.length || 0) > 0}
            copyIconSize={16}
            className="oui-max-h-[100px] oui-overflow-hidden oui-text-ellipsis oui-block oui-break-all"
            onCopy={props.onCopyIP}
          >
            {props.generateKey?.ip || "--"}
          </Text.formatted>{" "}
        </Statistic>
        <Statistic label="Permissions">
          <Text size="sm" intensity={80}>
            {props.generateKey?.permissions}
          </Text>
        </Statistic>
        <div></div>
        <Text color="warning" size="xs" className="oui-text-center">
          Please copy the API secret. Once you close this pop-up, the API secret
          will be encrypted.
        </Text>
      </Flex>
    </SimpleDialog>
  );
};
