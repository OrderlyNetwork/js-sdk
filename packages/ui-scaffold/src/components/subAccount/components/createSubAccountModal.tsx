import { useState, useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  Flex,
  SimpleDialog,
  toast,
  Text,
  TextField,
  useScreen,
} from "@orderly.network/ui";
import { AddIcon } from "../icons";
import { NickNameDescriptionText, NickNameTextField } from "./common";

const MAX_SUB_ACCOUNT_COUNT = 10;
type CreateSubAccountProps = {
  create: (nickName: string) => Promise<void>;
};

export const CreateSubAccount = (props: CreateSubAccountProps) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const [open, setOpen] = useState(false);
  const [nickName, setNickName] = useState<string | undefined>(undefined);
  const { state } = useAccount();
  const subAccountCount = useMemo(() => {
    return state.subAccounts?.length ?? 0;
  }, [state]);
  const trigger = (
    <AddIcon
      className="oui-cursor-pointer oui-fill-base-contrast-54 hover:oui-fill-base-contrast"
      onClick={() => setOpen(true)}
    />
  );
  const header = (
    <Flex
      py={3}
      direction="column"
      justify="between"
      itemAlign="start"
      width="100%"
    >
      <Text weight="semibold">Create sub-account</Text>
      <Text className="oui-text-2xs oui-text-base-contrast-36">
        You have {subAccountCount} sub-accounts.{" "}
        {MAX_SUB_ACCOUNT_COUNT - subAccountCount} more can be created.
      </Text>
    </Flex>
  );

  const reset = () => {
    setNickName("");
  };

  const doCreatSubAccount = (nickName: string | undefined) => {
    let _nickName = `Sub-account ${subAccountCount + 1}`;
    if (nickName) {
      _nickName = nickName.trim();
    }

    props
      .create(_nickName)
      .then((res) => {
        console.log("res", res);
        reset();
        toast.success("Sub-account created successfully.");

        setOpen(false);
      })
      .catch((e: any) => {
        toast.error("Failed to create sub-account.");
      });
  };
  return (
    <>
      {trigger}
      <SimpleDialog
        title={header}
        open={open}
        onOpenChange={(open) => {
          reset();
          setOpen(open);
        }}
        size={isMobile ? "sm" : "xl"}
        actions={{
          primary: {
            label: t("common.confirm"),
            onClick: () => doCreatSubAccount(nickName),
          },
        }}
      >
        <Text>Sub-account nickname</Text>
        <NickNameTextField
          nickName={nickName}
          setNickName={setNickName}
          subAccountCount={subAccountCount}
        />
      </SimpleDialog>
    </>
  );
};
