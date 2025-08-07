import { MessageDescriptor, useIntl } from "react-intl";
import { EN } from "./en-US";

export function useTranslation() {
  const { formatMessage } = useIntl();

  const translation = (
    id: keyof EN,
    options?: Pick<MessageDescriptor, "defaultMessage" | "description"> & {
      // Parameters<IntlFormatters["formatMessage"]>[1]
      values: Record<string, any>;
    },
  ) => {
    const { defaultMessage, description, values } = options || {};
    return formatMessage({ id, defaultMessage, description }, values);
  };

  return translation;
}
