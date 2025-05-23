import { useEffect, useState } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { SimpleDialog, toast, Text, TextField } from "@orderly.network/ui";
import { NickNameDescriptionText, NickNameTextField } from "./common";

export const EditNickNameDialog = (props: {
  nickName: string;
  open: boolean;
  accountId: string;
  onOpenChange: (open: boolean) => void;
}) => {
  const { subAccount } = useAccount();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [newNickName, setNewNickName] = useState(props.nickName);

  return (
    <SimpleDialog
      title={<Text>Edit nickname</Text>}
      open={props.open}
      onOpenChange={props.onOpenChange}
      actions={{
        primary: {
          label: t("common.confirm"),
          disabled: loading,
          loading: loading,
          onClick: () => {
            setLoading(true);
            subAccount
              ?.update({
                subAccountId: props.accountId,
                description: newNickName,
              })
              .catch((e) => {
                console.log("e", e);
                toast.error(e.message);
              })
              .then((res) => {
                toast.success("Nickname updated successfully.");
                props.onOpenChange(false);
              })
              .finally(() => {
                setLoading(false);
              });
          },
        },
        secondary: {
          label: t("common.cancel"),
          onClick: () => props.onOpenChange(false),
        },
      }}
    >
      <Text>Sub-account nickname</Text>
      <NickNameTextField
        nickName={newNickName}
        setNickName={(nickName) => {
          setNewNickName(nickName ?? "");
        }}
        subAccountCount={1}
      />
    </SimpleDialog>
  );
};
