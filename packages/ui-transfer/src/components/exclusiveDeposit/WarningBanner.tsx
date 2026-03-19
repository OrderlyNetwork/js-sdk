import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, WarningIcon } from "@orderly.network/ui";

export const WarningBanner: FC = () => {
  const { t: t0 } = useTranslation();
  const t = t0 as any;

  return (
    <Flex
      itemAlign="start"
      gap={1}
      className="oui-mt-4 oui-w-[calc(100%+2.5rem)] oui-rounded oui-bg-[#FF7D00]/10 oui-px-5 oui-py-2 oui-text-[#FF7D00]"
    >
      <Box className="oui-mt-0.5">
        <WarningIcon width={16} height={16} />
      </Box>
      <Text size="xs" intensity={80} className="oui-w-full oui-text-[#FF7D00]">
        {t("transfer.exclusiveDeposit.warning")}
      </Text>
    </Flex>
  );
};
