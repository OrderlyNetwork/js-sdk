import React, { FC, useEffect, useState } from "react";
import {
  Flex,
  SimpleDialog,
  Statistic,
  Text,
  TextField,
} from "@orderly.network/ui";
import { APIKeyItem } from "@orderly.network/hooks";
import { Checkbox } from "./createApiKey";

export const EditAPIKeyDialog: FC<{
  item: APIKeyItem;
  open: boolean;
  setOpen?: any;
  onUpdate?: (item: APIKeyItem, ip?: string) => Promise<void>;
}> = (props) => {
  const { item, open, setOpen, onUpdate } = props;
  console.log("edit dialog", item.ip_restriction_list.join(","));
  const [ipText, setIpText] = useState(item.ip_restriction_list?.join(","));
  const [read, setRead] = useState(true);
  const [trade, setTrade] = useState(true);

  useEffect(() => {
    setIpText(item.ip_restriction_list.join(","));
    setRead(item.scope?.toLocaleLowerCase().includes("read") || false);
    setTrade(item.scope?.toLocaleLowerCase().includes("trading") || false);
  }, [item]);

  // useEffect(() => {
  //   if (open) return;
  //   setIpText("");
  //   setRead(true);
  //   setTrade(true);
  // }, [open]);
  return (
    <SimpleDialog
      open={open}
      onOpenChange={setOpen}
      title="Edit API key"
      actions={{
        primary: {
          label: "Confirm",
          className: "oui-w-[120px] lg:oui-w-[154px]",
          onClick: async () => {
            await props.onUpdate?.(item, ipText);
            setOpen(false);
          },
          disabled: item.ip_restriction_list.join(",") === ipText,
        },
      }}
      classNames={{
        footer: "oui-justify-center",
        content:
          "oui-bg-base-8 oui-w-[300px] lg:oui-w-[360px] oui-font-semibold",
      }}
    >
      <Flex direction={"column"} gap={6}>
        {/* <TextField label={"IP restriction (optional)"} rows={5} className="oui-w-full oui-h-auto" classNames={{
          input: "oui-h-[100px]",
          root: "oui-h-[100px]"
        }}/> */}
        <Flex direction={"column"} gap={1} width={"100%"} itemAlign={"start"}>
          <Text intensity={54} size="2xs">
            IP restriction (optional)
          </Text>
          <textarea
            placeholder="Add up to 20 IP addresses, separated by commas. "
            className="oui-text-sm oui-text-base-contrast-80 oui-p-3 oui-h-[100px] oui-rounded-xl oui-bg-base-7 oui-w-full oui-border-none focus:oui-outline-none"
            value={ipText}
            onChange={(e) => {
              setIpText(e.target.value);
            }}
          ></textarea>
        </Flex>
        <Statistic
          label={
            <Text size="xs" intensity={54}>
              Permissions
            </Text>
          }
          className="oui-w-full"
        >
          <Flex
            direction={"row"}
            gap={6}
            itemAlign={"start"}
            className="oui-mt-2"
          >
            <Flex direction={"row"} gap={2}>
              <Checkbox
                // className="oui-w-[14px] oui-h-[14px] oui-border-white/[.54] data-[state=checked]:oui-bg-white/80"
                size={18}
                checked={read}
                onCheckedChange={(e) => setRead(e as boolean)}
                disabled
              />
              <Text intensity={54} size="sm">
                Read
              </Text>
            </Flex>
            <Flex direction={"row"} gap={2}>
              <Checkbox
                // className="oui-w-[14px] oui-h-[14px] oui-border-white/[.54] data-[state=checked]:oui-bg-white/80"
                size={18}
                checked={trade}
                onCheckedChange={(e) => setTrade(e as boolean)}
                disabled
              />
              <Text intensity={54} size="sm">
                Trade
              </Text>
            </Flex>
          </Flex>
        </Statistic>
      </Flex>
    </SimpleDialog>
  );
};
