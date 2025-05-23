import { useTranslation } from "@orderly.network/i18n";
import { TextField } from "@orderly.network/ui";

export const NickNameDescriptionText =
  "5-20 characters. Special characters not allowed.";

export const NickNameTextField = (props: {
  nickName: string | undefined;
  setNickName: (nickName: string | undefined) => void;
  subAccountCount: number;
}) => {
  return (
    <TextField
      placeholder={`Sub-account ${props.subAccountCount + 1}`}
      fullWidth
      label=""
      value={props.nickName}
      onChange={(e) => {
        props.setNickName(e.target.value);
      }}
      classNames={{
        label: "oui-text-base-contrast-54 oui-text-xs",
        input: "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
      }}
      maxLength={20}
      minLength={5}
      autoComplete="off"
      helpText={NickNameDescriptionText}
      className="oui-mb-4"
    />
  );
};
