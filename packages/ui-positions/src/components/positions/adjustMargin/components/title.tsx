import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text, Divider, CloseIcon } from "@orderly.network/ui";

export const Title: FC<{ close: () => void }> = ({ close }) => {
  const { t } = useTranslation();
  return (
    <div className="oui-w-full">
      <Flex justify="between" itemAlign="center">
        <Text
          className="oui-text-base oui-leading-6 oui-font-semibold oui-tracking-[0.48px]"
          intensity={98}
        >
          {t("positions.adjustMargin.title")}
        </Text>
        <button
          type="button"
          className="oui-flex oui-size-[18px] oui-items-center oui-justify-center"
          onClick={close}
          aria-label="close adjust margin"
        >
          <CloseIcon size={18} color="white" opacity={0.98} />
        </button>
      </Flex>
      <Divider className="oui-mt-[9px] oui-w-full" />
    </div>
  );
};

export default Title;
