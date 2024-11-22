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
  item: APIKeyItem;
  open: boolean;
  setOpen?: any;
  onDelete?: (item: APIKeyItem) => Promise<void>;
}> = (props) => {
  const { item, open, setOpen, onDelete } = props;

  return (
    <SimpleDialog
      size="sm"
      open={open}
      onOpenChange={setOpen}
      title="Delete API key"
      actions={{
        primary: {
          label: "Confirm",
          "data-testid": "oui-testid-apiKey-deleteApiKey-dialog-confirm-btn",
          className: "oui-w-[120px] lg:oui-w-[154px]",
          size: "md",
          onClick: async () => {
            await props.onDelete?.(item);
            setOpen(false);
          },
        },
        secondary: {
          label: "Cancel",
          className: "oui-w-[120px] lg:oui-w-[154px]",
          size: "md",
          onClick: async () => {
            setOpen(false);
          },
        },
      }}
      classNames={{
        footer: "oui-justify-center",
        content:
          "oui-bg-base-8 oui-w-[300px] lg:oui-w-[360px] oui-font-semibold",
      }}
    >
      <Flex className="oui-text-xs">
        Delete your API key &nbsp;
        <Text color="primary">{formatKey(item?.orderly_key)}</Text>&nbsp;?
      </Flex>
    </SimpleDialog>
  );
};
