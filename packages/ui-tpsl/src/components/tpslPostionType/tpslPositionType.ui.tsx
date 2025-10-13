import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { PositionType } from "@kodiak-finance/orderly-types";
import {
  ExclamationFillIcon,
  Flex,
  Select,
  Text,
  Tooltip,
} from "@kodiak-finance/orderly-ui";
import { useTPSLPositionTypeScript } from "./tpslPositionType.script";

type TPSLPositionTypeUIProps = ReturnType<typeof useTPSLPositionTypeScript>;

const positionTypeKey = "position_type";
export const TPSLPositionTypeUI = (props: TPSLPositionTypeUIProps) => {
  const { t } = useTranslation();
  const options = [
    {
      label: t("tpsl.positionType.partial"),
      value: PositionType.PARTIAL,
    },
    {
      label: t("tpsl.positionType.full"),
      value: PositionType.FULL,
    },
  ];

  return (
    <Flex gap={1} itemAlign={"center"} justify={"start"}>
      <Tooltip
        className="oui-w-[280px] oui-p-3"
        content={
          props.value === PositionType.FULL
            ? t("tpsl.positionType.full.tips")
            : t("tpsl.positionType.partial.tips")
        }
      >
        <ExclamationFillIcon
          className="oui-cursor-pointer oui-text-base-contrast-54"
          size={12}
        />
      </Tooltip>
      {props.disableSelector ? (
        props.value === PositionType.FULL ? (
          <Text className="oui-text-2xs oui-font-semibold oui-text-base-contrast-54">
            {t("tpsl.positionType.full")}
          </Text>
        ) : (
          <Text className="oui-text-2xs oui-font-semibold oui-text-base-contrast-54">
            {t("tpsl.positionType.partial")}
          </Text>
        )
      ) : (
        <Select.options
          value={props.value}
          options={options}
          onValueChange={(event) => {
            props.onChange(positionTypeKey, event as PositionType);
          }}
          size={"xs"}
          classNames={{
            trigger: " oui-bg-transparent oui-border-0 oui-w-auto oui-px-0",
          }}
          contentProps={{
            className: " oui-bg-base-8 oui-border-0",
          }}
        />
      )}
    </Flex>
  );
};
