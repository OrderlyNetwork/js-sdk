import { FC, useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, ChainIcon, Flex, Text, TokenIcon } from "@orderly.network/ui";
import { CopyAddress } from "./CopyAddress";
import { DepositStatusBlock } from "./DepositStatus";
import { NetworkTokenSelect } from "./NetworkTokenSelect";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { WarningBanner } from "./WarningBanner";
import { useExclusiveDeposit } from "./hooks/useExclusiveDeposit";
import { useExclusiveDepositOptions } from "./hooks/useExclusiveDepositOptions";

type ExclusiveDepositProps = {
  active?: boolean;
};

export const ExclusiveDeposit: FC<ExclusiveDepositProps> = ({ active }) => {
  const { t: t0 } = useTranslation();
  const t = t0 as any;
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedToken, setSelectedToken] = useState("");

  const { networkOptions, tokenOptions, isSupported } =
    useExclusiveDepositOptions({
      selectedNetwork,
    });

  const confirmed = !!selectedNetwork && !!selectedToken;

  // Reset token when network changes and current token is unavailable
  useEffect(() => {
    if (
      selectedToken &&
      tokenOptions.length > 0 &&
      !tokenOptions.some((t) => t.value === selectedToken)
    ) {
      setSelectedToken("");
    }
  }, [selectedNetwork, selectedToken, tokenOptions]);

  const selectedNetworkOption = selectedNetwork
    ? networkOptions.find((n) => n.value === selectedNetwork)
    : undefined;
  const selectedChainId = selectedNetworkOption?.chainId;
  const selectedTokenOption = selectedToken
    ? tokenOptions.find((t) => t.value === selectedToken)
    : undefined;

  const {
    address,
    qrUri,
    minimumDeposit,
    estimatedArrivalText,
    latestEvent,
    pendingCount,
    explorerUrl,
  } = useExclusiveDeposit({
    active,
    confirmed,
    chainId: selectedChainId,
    token: selectedToken,
    explorerBaseUrl: selectedNetworkOption?.explorerUrl ?? "",
  });

  const networkName = selectedNetworkOption?.label ?? "";
  const tokenName = selectedTokenOption?.label ?? "";

  const warningMessage = confirmed
    ? t("transfer.exclusiveDeposit.warning", {
        token: tokenName,
        network: networkName,
      })
    : t("transfer.exclusiveDeposit.selectFirst");

  const minText =
    confirmed && typeof minimumDeposit === "number"
      ? `${minimumDeposit} ${tokenName}`
      : "--";

  const estText = confirmed
    ? (estimatedArrivalText ??
      t("transfer.exclusiveDeposit.estimatedTime.default"))
    : "--";

  return (
    <Box className="oui-flex oui-flex-col oui-items-center oui-rounded-xl oui-bg-base-8 oui-tracking-[0.03em]">
      <WarningBanner message={warningMessage} />

      {confirmed && (
        <>
          <QRCodeDisplay address={qrUri} />
          {address && <CopyAddress address={address} />}
        </>
      )}

      <Flex direction="column" gap={2} className="oui-mt-5 oui-w-full">
        {confirmed ? (
          <>
            <Flex className="oui-w-full" justify="between" itemAlign="center">
              <Text size="xs" intensity={36}>
                {t("common.network")}
              </Text>
              <Flex gap={1} itemAlign="center">
                <ChainIcon chainId={selectedChainId!} size="2xs" />
                <Text size="xs" intensity={98}>
                  {networkName}
                </Text>
              </Flex>
            </Flex>
            <Flex className="oui-w-full" justify="between" itemAlign="center">
              <Text size="xs" intensity={36}>
                {t("common.token")}
              </Text>
              <Flex gap={1} itemAlign="center">
                <TokenIcon name={tokenName} size="2xs" />
                <Text size="xs" intensity={98}>
                  {tokenName}
                </Text>
              </Flex>
            </Flex>
          </>
        ) : (
          <NetworkTokenSelect
            selectedNetwork={selectedNetwork}
            selectedToken={selectedToken}
            onNetworkChange={setSelectedNetwork}
            onTokenChange={setSelectedToken}
            networkOptions={networkOptions}
            tokenOptions={tokenOptions}
          />
        )}

        {/* Min. Deposit */}
        <Flex className="oui-w-full" justify="between">
          <Text size="xs" intensity={36}>
            {t("transfer.exclusiveDeposit.minDeposit")}
          </Text>
          <Text
            size="xs"
            className={confirmed ? "oui-text-[#FF7D00]" : ""}
            intensity={confirmed ? undefined : 98}
          >
            {minText}
          </Text>
        </Flex>

        {/* Estimated time */}
        <Flex className="oui-w-full" justify="between">
          <Text size="xs" intensity={36}>
            {t("transfer.exclusiveDeposit.estimatedTime")}
          </Text>
          <Text size="xs" intensity={98}>
            {estText}
          </Text>
        </Flex>
      </Flex>

      {confirmed && latestEvent && explorerUrl && (
        <DepositStatusBlock
          amount={latestEvent.amount}
          symbol={latestEvent.token}
          pendingCount={pendingCount}
          explorerUrl={explorerUrl}
        />
      )}
    </Box>
  );
};
