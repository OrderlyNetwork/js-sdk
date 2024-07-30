import {Box, Flex, Text, textVariants} from "@orderly.network/ui"
import {UseWithdrawFormScriptReturn} from "./script";
import {Web3Wallet} from "../web3Wallet";
import {ExchangeDivider} from "../exchangeDivider";
import {BrokerWallet} from "../brokerWallet";
import {ChainSelect} from "../chainSelect";
import {QuantityInput} from "../quantityInput";
import {AvailableQuantity} from "../availableQuantity";
import {WithdrawWarningMessage} from "../withdrawWarningMessage";
import {UnsettlePnlInfo} from "../unsettlePnlInfo";
import {WithdrawAction} from "../withdrawAction";

export const WithdrawFormUI = (
    {
        walletName,
        address,
        brokerName,
        loading,
        disabled,
        quantity,
        onQuantityChange,
        token,
        inputStatus,
        hintMessage,
        dst,
        amount,
        maxQuantity,
        balanceRevalidating,
        chains,
        currentChain,
        onChainChange,
        fee,
        settingChain,
        wrongNetwork,
        hasPositions,
        unsettledPnL,
        onSettlePnl,
        onWithdraw,
        chainVaultBalance,
        crossChainWithdraw
    }: UseWithdrawFormScriptReturn
) => {
    return (
        <Box id="oui-withdraw-form" className={textVariants({weight: "semibold"})}>
            <Box mb={5}>

                <BrokerWallet name={brokerName}/>
                <Box mt={3} mb={1}>
                    <QuantityInput
                        value={quantity}
                        onValueChange={onQuantityChange}
                        tokens={[]}
                        token={token}
                        onTokenChange={() => {
                        }}
                        status={inputStatus}
                        hintMessage={hintMessage}
                        precision={2}
                    />
                </Box>

                <AvailableQuantity
                    token={token}
                    amount={amount}
                    maxQuantity={maxQuantity.toString()}
                    precision={dst.decimals!}
                    loading={balanceRevalidating}
                    onClick={() => {
                        onQuantityChange(maxQuantity.toString());
                    }}
                />
                <UnsettlePnlInfo unsettledPnl={unsettledPnL} hasPositions={hasPositions} onSettlle={onSettlePnl}/>

                <ExchangeDivider/>
                <Web3Wallet name={walletName} address={address}/>
                <Box mt={3}>
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
                        token={token}
                        tokens={[]}
                        value={quantity}
                        precision={dst?.decimals}
                        readOnly
                    />
                </Box>
                <Flex direction="column" mt={1} gapY={1} itemAlign="start">
                    <Text
                        size="xs"
                        intensity={36}
                    >
                        {`Fee ≈ `}
                        <Text size="xs" intensity={80}>
                            {`${fee} `}
                        </Text>
                        <Text>
                            USDC
                        </Text>

                    </Text>
                </Flex>
            </Box>

            <WithdrawWarningMessage chainVaultBalance={chainVaultBalance} currentChain={currentChain} quantity={quantity} maxAmount={maxQuantity}/>

            <Flex justify="center" mt={3}>
                <WithdrawAction
                    disabled={disabled}
                    loading={loading}
                    onWithdraw={onWithdraw}
                    crossChainWithdraw={crossChainWithdraw}
                    currentChain={currentChain}
                    address={address}
                    quantity={quantity}
                    fee={fee}
                />
            </Flex>
        </Box>
    )
}