import { FC } from "react";
import { UseDepositFormScriptReturn } from "./depositForm.script";
import {
  Box,
  Flex,
  Text,
  textVariants,
  WalletIcon,
  Button,
} from "@orderly.network/ui";
import { TokenInput } from "../tokenInput";
import { ArrowDownIcon } from "../../icons";
import { AuthGuard } from "@orderly.network/ui-connector";
import { NetworkSelect } from "../networkSelect";

export const DepositForm: FC<UseDepositFormScriptReturn> = (props) => {
  const {
    walletName,
    address,
    token,
    tokens,
    brokerId,
    brokerName,
    chains,
    currentChain,
    maxAmount,
  } = props;
  return (
    <Box id="oui-deposit-form" className={textVariants({ weight: "semibold" })}>
      <Flex justify="between">
        <Text size="sm">Your Web3 Wallet</Text>

        <Flex gapX={1}>
          <WalletIcon name={walletName} />
          <Text intensity={54}>{address}</Text>
        </Flex>
      </Flex>
      <Box my={3}>
        <NetworkSelect chains={chains} currentChain={currentChain!} />
        <TokenInput
          tokens={tokens.map((item) => item.symbol)}
          classNames={{
            root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
          }}
        />
      </Box>

      <Flex justify="between">
        <Text size="2xs" intensity={36}>
          $0
        </Text>

        <Flex gapX={2}>
          <Text size="2xs" intensity={36}>
            Available: {maxAmount} USDC
          </Text>

          <Text size="2xs" color="primaryLight" className="oui-cursor-pointer">
            Max
          </Text>
        </Flex>
      </Flex>

      <ExchangeLine />

      <Flex justify="between" my={3}>
        <Text size="sm">{`Your ${brokerName} account`}</Text>

        <WalletIcon name={walletName} />
      </Flex>

      <TokenInput tokens={tokens.map((item) => item.symbol)} />

      <Summary />

      <Flex justify="center" mt={8}>
        <Box width={184}>
          <AuthGuard>
            <Button fullWidth>Deposit</Button>
          </AuthGuard>
        </Box>
      </Flex>
    </Box>
  );
};

type SummaryProps = {};

const Summary: FC<SummaryProps> = (props) => {
  return (
    <>
      <Box mt={1}>
        <Text size="xs" intensity={36}>
          <Text size="xs" intensity={80}>
            {`1 `}
          </Text>
          USDC =
          <Text size="xs" intensity={80}>
            {` 1 `}
          </Text>
          USDC
        </Text>
      </Box>

      <Box>
        <Text size="xs" intensity={36}>
          {`Fee ≈ `}
          <Text size="xs" intensity={80}>
            {`0 `}
          </Text>
          USDC
        </Text>
      </Box>
    </>
  );
};

const ExchangeLine: FC = () => {
  return (
    <Flex>
      <Flex height={1} className="oui-bg-base-contrast-12 oui-flex-1"></Flex>
      <ArrowDownIcon className="oui-text-primary-light" />
      <Flex height={1} className="oui-bg-base-contrast-12 oui-flex-1"></Flex>
    </Flex>
  );
};
