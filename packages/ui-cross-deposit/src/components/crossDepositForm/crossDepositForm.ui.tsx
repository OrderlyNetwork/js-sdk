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
import { Slippage } from "../swap/slippage";
import { SwapFee } from "../swap/swapFee";
import { Notice } from "../swap/notice";
import { CrossDepositProvider } from "../../provider";

export const CrossDepositForm: FC<UseCrossDepositFormScriptReturn> = (
  props
) => {
  const {
    token,
    tokens,
    onTokenChange,
    amount,
    quantity,
    maxQuantity,
    swapQuantity,
    onQuantityChange,
    hintMessage,
    inputStatus,
    chains,
    currentChain,
    settingChain,
    onChainChange,
    actionType,
    onDeposit,
    onApprove,
    fetchBalance,
    dst,
    wrongNetwork,
    balanceRevalidating,
    loading,
    disabled,
    networkId,
    slippage,
    onSlippageChange,
    needSwap,
    needCrossSwap,
    swapPrice,
    swapRevalidating,
    warningMessage,
    fee,
  } = props;

  return (
    <CrossDepositProvider>
      <Box
        id="oui-cross-deposit-form"
        className={textVariants({ weight: "semibold" })}
      >
        <Box className="oui-mb-6 lg:oui-mb-8">
          <Web3Wallet />

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
              data-testid="oui-testid-deposit-dialog-quantity-input"
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

          <BrokerWallet />

          <QuantityInput
            readOnly
            token={dst as any}
            value={swapQuantity}
            loading={swapRevalidating}
            classNames={{
              root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
            }}
          />

          <Flex direction="column" itemAlign="start" mt={1} gapY={1}>
            <Flex justify="between" width="100%">
              <SwapCoin token={token} dst={dst} price={swapPrice} />
              {(needSwap || needCrossSwap) && (
                <Slippage value={slippage} onValueChange={onSlippageChange} />
              )}
            </Flex>

            <SwapFee {...fee} />
          </Flex>
        </Box>

        <Notice
          message={warningMessage}
          needSwap={needSwap}
          needCrossSwap={needCrossSwap}
          wrongNetwork={wrongNetwork}
          networkId={networkId}
        />

        <Flex justify="center">
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
