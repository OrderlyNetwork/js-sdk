import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  inputFormatter,
  modal,
  SimpleDialog,
  TextField,
  Text,
  useModal,
  Flex,
  cn,
  toast,
} from "@orderly.network/ui";
import { ReferralCodeType } from "./referralCodes.script";

export const EditCodeModal = modal.create<{
  code: ReferralCodeType;
  successCallback: () => void;
}>((props) => {
  const { t } = useTranslation();
  const { visible, onOpenChange } = useModal();
  const [newCode, setNewCode] = useState<string>("");
  const [filedError, setFiledError] = useState<{
    length: boolean;
    format: boolean;
  }>({
    length: false,
    format: false,
  });
  const [editCode, { error, isMutating }] = useMutation(
    "/v1/referral/edit_referral_code",
    "POST",
  );
  useEffect(() => {
    setNewCode(props.code.code);
  }, [props.code]);

  useEffect(() => {
    const _code = newCode.toUpperCase();
    const _fieldError = {
      length: false,
      format: false,
    };
    if (_code.length < 4 || _code.length > 10) {
      _fieldError.length = true;
    }
    if (!/^[A-Z0-9]+$/.test(_code)) {
      _fieldError.format = true;
    }
    setFiledError(_fieldError);
  }, [newCode]);

  return (
    <SimpleDialog
      classNames={{
        content: "oui-max-w-[360px]",
      }}
      title={<div>{t("affiliate.referralCode.editCodeModal.title")}</div>}
      open={visible}
      onOpenChange={onOpenChange}
      actions={{
        primary: {
          loading: isMutating,
          disabled: filedError.length || filedError.format,
          label: t("common.confirm"),
          onClick: async () => {
            try {
              const res = await editCode({
                current_referral_code: props.code.code,
                new_referral_code: newCode.toUpperCase(),
              });
              if (res.success) {
                toast.success(
                  t("affiliate.referralCode.editCodeModal.success"),
                );
                props.successCallback();
                onOpenChange(false);
                return;
              }
              toast.error(res.message);
            } catch (e) {
              console.log("edit referral code error", e);
            }
          },
        },
      }}
    >
      <div className="oui-mb-6 oui-text-xs oui-text-base-contrast-54">
        {t("affiliate.referralCode.editCodeModal.description")}
      </div>
      <TextField
        placeholder=""
        fullWidth
        label={t("affiliate.referralCode.editCodeModal.label")}
        onClean={() => {
          setNewCode("");
        }}
        value={newCode}
        onChange={(e) => {
          const _value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
          setNewCode(_value);
        }}
        formatters={[
          inputFormatter.createRegexInputFormatter((value: string | number) => {
            return String(value).replace(/[a-z]/g, (char: string) =>
              char.toUpperCase(),
            );
          }),
          inputFormatter.createRegexInputFormatter(/[^A-Z0-9]/g),
        ]}
        classNames={{
          label: "oui-text-base-contrast-54 oui-text-xs",
          input:
            "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
        }}
        maxLength={10}
        minLength={4}
        autoComplete="off"
        helpText=""
      />
      <Flex
        direction={"column"}
        justify={"center"}
        itemAlign={"start"}
        gap={1}
        className="oui-mt-3"
      >
        <Text
          className={cn(
            "oui-ml-4 oui-list-item oui-list-outside oui-list-disc oui-text-xs oui-text-base-contrast-36 marker:oui-text-3xs",
            filedError.length ? "oui-text-danger" : "oui-text-success",
          )}
        >
          {t("affiliate.referralCode.editCodeModal.helpText.length")}
        </Text>
        <Text
          className={cn(
            "oui-ml-4 oui-list-item oui-list-outside oui-list-disc oui-text-xs oui-text-base-contrast-36 marker:oui-text-3xs",
            "oui-text-success",
          )}
        >
          {t("affiliate.referralCode.editCodeModal.helpText.format")}
        </Text>
      </Flex>
    </SimpleDialog>
  );
});
