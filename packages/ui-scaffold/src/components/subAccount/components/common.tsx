import { useTranslation } from "@orderly.network/i18n";
import { inputFormatter, TextField } from "@orderly.network/ui";

export const NickNameDescriptionText =
  "5-20 characters. Only letters, numbers, and @ , _ - (space) allowed.";

export const NickNameTextField = (props: {
  nickName: string | undefined;
  setNickName: (nickName: string | undefined) => void;
  subAccountCount?: number;
  invalid?: boolean;
}) => {
  return (
    <TextField
      placeholder={`Sub-account ${(props.subAccountCount ?? 0) + 1}`}
      fullWidth
      label="Sub-account nickname"
      value={props.nickName}
      onChange={(e) => {
        props.setNickName(e.target.value);
      }}
      formatters={[
        inputFormatter.createRegexInputFormatter(/[^a-zA-Z0-9@,\s_-]/g),
      ]}
      classNames={{
        label: "oui-text-base-contrast-54 oui-text-xs",
        input: "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
      }}
      maxLength={20}
      minLength={5}
      autoComplete="off"
      helpText={NickNameDescriptionText}
      className="oui-mb-4"
      color={props.invalid ? "danger" : undefined}
    />
  );
};
