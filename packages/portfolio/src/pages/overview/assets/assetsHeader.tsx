import {
  ArrowDownSquareFillIcon,
  ArrowUpSquareFillIcon,
  Button,
  CardTitle,
  Flex,
  Text,
} from "@orderly.network/ui";
import { FC } from "react";

type Props = {
  disabled: boolean;
  onWithdraw?: () => void;
  onDeposit?: () => void;
};

export const AssetsHeader: FC<Props> = (props) => {
  return (
    <Flex justify={"between"}>
      <CardTitle>Overview</CardTitle>
      <Flex gap={3}>
        <Button
          disabled={props.disabled}
          size="md"
          color="secondary"
          onClick={() => props.onWithdraw?.()}
          icon={<ArrowUpSquareFillIcon />}
          data-testid="oui-testid-portfolio-assets-withdraw-btn"
          >
          Withdraw
        </Button>
        <Button
          disabled={props.disabled}
          size="md"
          onClick={() => props.onDeposit?.()}
          icon={<ArrowDownSquareFillIcon />}
          data-testid="oui-testid-portfolio-assets-deposit-btn"
        >
          Deposit
        </Button>
      </Flex>
    </Flex>
  );
};
