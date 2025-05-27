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
  cn,
  Tooltip,
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
  const [invalid, setInvalid] = useState(false);
  const subAccountCount = useMemo(() => {
    return state.subAccounts?.length ?? 0;
  }, [state]);
  const trigger = useMemo(() => {
    return subAccountCount >= MAX_SUB_ACCOUNT_COUNT ? (
      <Tooltip
        className="oui-max-w-[188px]"
        content={"You have reached the maximum limit of 10 sub-accounts."}
      >
        <AddIcon
          className={cn("oui-fill-base-contrast-20 oui-cursor-not-allowed")}
        />
      </Tooltip>
    ) : (
      <AddIcon
        className={cn(
          "oui-cursor-pointer oui-fill-base-contrast-54 hover:oui-fill-base-contrast",
        )}
        onClick={() => {
          setOpen(true);
        }}
      />
    );
  }, [subAccountCount]);

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

  const validateNickName = (nickName: string | undefined) => {
    if (nickName && nickName.length >= 1 && nickName.length < 5) {
      setInvalid(true);
      return true;
    }
    setInvalid(false);
    return false;
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
            onClick: () => {
              const invalid = validateNickName(nickName);
              if (invalid) {
                return;
              }
              doCreatSubAccount(nickName);
            },
          },
        }}
        classNames={{
          content: "oui-w-[360px]",
        }}
      >
        <NickNameTextField
          nickName={nickName}
          setNickName={(nickName) => {
            validateNickName(nickName);
            setNickName(nickName);
          }}
          subAccountCount={subAccountCount}
          invalid={invalid}
        />
      </SimpleDialog>
    </>
  );
};
