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
      open={props.showCreatedDialog}
      onOpenChange={(open) => {
        props.hideCreatedDialog?.();
      }}
      title="API key created"
      actions={{
        primary: {
          label: "Confirm",
          className: "oui-w-[120px] lg:oui-w-[154px] oui-bg-base-2 hover:oui-bg-base-3",
          onClick: async () => {
            return props.doConfirm();
          },
        },
        secondary: {
          label: "Copy API info",
          className: "oui-w-[120px] lg:oui-w-[154px] oui-bg-primary hover:oui-opacity-80",
          onClick: async () => {
            return props.onCopyApiKeyInfo();
          },
        },
      }}
      footerClassName="oui-justify-center"
      contentClassName="oui-bg-base-8 oui-w-[300px] lg:oui-w-[360px] oui-font-semibold"
    >
      <Flex direction={"column"} gap={4} itemAlign={"start"}>
        <Statistic label="API key">
          <Text.formatted size="sm" intensity={80} copyable className="oui-break-all">
            {props.generateKey?.key}
          </Text.formatted>
        </Statistic>
        <Statistic label="Secret key">
          <Text.formatted size="sm" intensity={80} copyable className="oui-break-all">
            {props.generateKey?.screctKey}
          </Text.formatted>{" "}
        </Statistic>
        <Statistic label="IP">
          <Text.formatted size="sm" intensity={80} copyable className="oui-break-all">
            {props.generateKey?.ip || "-"}
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
