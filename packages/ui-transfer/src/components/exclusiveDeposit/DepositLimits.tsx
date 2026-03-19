import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text } from "@orderly.network/ui";

type DepositLimitsProps = {
  minimumDeposit?: number;
  estimatedArrivalText?: string;
};

export const DepositLimits: FC<DepositLimitsProps> = ({
  minimumDeposit,
  estimatedArrivalText,
}) => {
  const { t: t0 } = useTranslation();
  const t = t0 as any;

  const minText =
    typeof minimumDeposit === "number" ? `${minimumDeposit} USDC` : "—";

  return (
    <Flex direction="column" gap={2} className="oui-mt-6 oui-w-full">
      <Flex className="oui-w-full" justify="between">
        <Text size="xs" intensity={36}>
          {t("common.network")}
        </Text>
        <Flex gap={1} itemAlign="center">
          <img
            src="https://oss.orderly.network/static/network_logo/42161.png"
            alt="Arbitrum"
            className="oui-size-4 oui-rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <Text size="xs" intensity={98}>
            Arbitrum
          </Text>
        </Flex>
      </Flex>
      <Flex className="oui-w-full" justify="between">
        <Text size="xs" intensity={36}>
          {t("common.token")}
        </Text>
        <Flex gap={1} itemAlign="center">
          <img
            src="https://oss.orderly.network/static/symbol_logo/USDC.png"
            alt="USDC"
            className="oui-size-4 oui-rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <Text size="xs" intensity={98}>
            USDC
          </Text>
        </Flex>
      </Flex>
      <Flex className="oui-w-full" justify="between">
        <Text size="xs" intensity={36}>
          {t("transfer.exclusiveDeposit.minDeposit")}
        </Text>
        <Text size="xs" className="oui-text-[#FF7D00]">
          {minText}
        </Text>
      </Flex>
      <Flex className="oui-w-full" justify="between">
        <Text size="xs" intensity={36}>
          {t("transfer.exclusiveDeposit.estimatedTime")}
        </Text>
        <Text size="xs" intensity={98}>
          {estimatedArrivalText ??
            t("transfer.exclusiveDeposit.estimatedTime.default")}
        </Text>
      </Flex>
    </Flex>
  );
};
