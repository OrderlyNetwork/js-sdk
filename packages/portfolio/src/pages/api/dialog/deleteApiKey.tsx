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
import { APIKeyItem } from "@orderly.network/hooks";
import { formatKey } from "../apiManager.ui";

export const DeleteAPIKeyDialog: FC<{
  item: APIKeyItem,
  open: boolean;
  setOpen?: any,
  onDelete?: (item: APIKeyItem) => Promise<void>
}> = (props) => {
  const { item, open, setOpen, onDelete} = props;
  
  return (
    <SimpleDialog
      open={open}
      onOpenChange={setOpen}
      title="API key created"
      actions={{
        primary: {
          label: "Confirm",
          className: "oui-w-[120px] lg:oui-w-[154px]",
          onClick: async () => {
            await props.onDelete?.(item);
            setOpen(false);
          },
        },
        secondary: {
          label:"Cancel",
          className: "oui-w-[120px] lg:oui-w-[154px]",
          onClick: async () => {
            setOpen(false);
          }
        }
      }}
      footerClassName="oui-justify-center"
      contentClassName="oui-bg-base-8 oui-w-[300px] lg:oui-w-[360px] oui-font-semibold"
    >
     
        <Text  size="xs">{`Delete your API key ${formatKey(item?.orderly_key)}`}</Text>
    </SimpleDialog>
  );
};
