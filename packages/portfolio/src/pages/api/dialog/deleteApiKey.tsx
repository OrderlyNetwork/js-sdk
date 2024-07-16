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

export const DeleteAPIKeyDialog: FC<ApiManagerScriptReturns> = (props) => {
  
  
  return (
    <SimpleDialog
      open={props.showDeleteDialog}
      onOpenChange={(open) => {
        props.hideDeleteDialog?.();
      }}
      title="API key created"
      actions={{
        primary: {
          label: "Confirm",
          className: "oui-w-[120px] lg:oui-w-[154px]",
          onClick: async () => {
            return props.doCreate();
          },
        },
        secondary: {
          label:"Cancel",
          className: "oui-w-[120px] lg:oui-w-[154px]",
          onClick: async () => {
            props.hideDeleteDialog();
          }
        }
      }}
      footerClassName="oui-justify-center"
      contentClassName="oui-bg-base-8 oui-w-[300px] lg:oui-w-[360px] oui-font-semibold"
    >
     
        <Text  size="xs">{`Delete your API key ${"asdfsdf"}`}</Text>
    </SimpleDialog>
  );
};
