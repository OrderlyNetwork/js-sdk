import { FC } from "react";
import { UseCrossDepositFormScriptReturn } from "./crossDepositForm.script";
import { Box, Flex, textVariants } from "@orderly.network/ui";
import {
  ActionButton,
  AvailableQuantity,
  BrokerWallet,
  ChainSelect,
  SwapCoin,
  ExchangeDivider,
  QuantityInput,
  Web3Wallet,
} from "@orderly.network/ui-transfer";
import { Slippage } from "../slippage";
import { CrossDepositProvider } from "../provider/crossDepositProvider";
import { SwapFee } from "../swapFee";

export const CrossDepositForm: FC<UseCrossDepositFormScriptReturn> = (
  props
) => {
  const {
    walletName,
    address,
    token,
    tokens,
    brokerName,
    chains,
    currentChain,
    maxQuantity,
    amount,
    onChainChange,
    quantity,
    onQuantityChange,
    inputStatus,
    hintMessage,
    disabled,
    onTokenChange,
    onDeposit,
    onApprove,
    dst,
    price,
    fee,
    nativeToken,
    loading,
    actionType,
    fetchBalance,
    balanceRevalidating,
    wrongNetwork,
    networkId,
    settingChain,
    slippage,
    onSlippageChange,
    needSwap,
    needCrossSwap,
    swapQuantity,
    swapPrice,
    swapRevalidating,
  } = props;

  return (
    <CrossDepositProvider needSwap={needSwap} needCrossSwap={needCrossSwap}>
      <Box
        id="oui-cross-deposit-form"
        className={textVariants({ weight: "semibold" })}
      >
        <Web3Wallet name={walletName} address={address} />

        <Box mt={3} mb={1}>
          <ChainSelect
            chains={chains}
            value={currentChain!}
            onValueChange={onChainChange}
            wrongNetwork={wrongNetwork}
            loading={settingChain}
          />
          <QuantityInput
            classNames={{
              root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
            }}
            value={quantity}
            onValueChange={onQuantityChange}
            tokens={tokens}
            token={token}
            onTokenChange={onTokenChange}
            status={inputStatus}
            hintMessage={hintMessage}
            fetchBalance={fetchBalance}
          />
        </Box>

        <AvailableQuantity
          token={token}
          amount={amount}
          maxQuantity={maxQuantity}
          loading={balanceRevalidating}
          onClick={() => {
            onQuantityChange(maxQuantity);
          }}
        />
        <ExchangeDivider />

        <BrokerWallet name={brokerName} />

        <QuantityInput
          readOnly
          token={dst as any}
          value={swapQuantity}
          loading={swapRevalidating}
          classNames={{
            root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
          }}
        />

        <Flex direction="column" mt={1} gapY={1} itemAlign="start">
          <Flex justify="between" width="100%">
            <SwapCoin token={token} dst={dst} price={swapPrice} />
            <Slippage value={slippage} onValueChange={onSlippageChange} />
          </Flex>

          <SwapFee {...fee} />
        </Flex>

        <Flex justify="center" mt={8}>
          <ActionButton
            actionType={actionType}
            symbol={token?.symbol}
            disabled={disabled}
            loading={loading}
            onDeposit={onDeposit}
            onApprove={onApprove}
            networkId={networkId}
          />
        </Flex>
      </Box>
    </CrossDepositProvider>
  );
};
