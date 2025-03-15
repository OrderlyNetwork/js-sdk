import { FC } from "react";
import {
  ArrowDownSquareFillIcon,
  ArrowUpSquareFillIcon,
  Button,
  CardTitle,
  Flex,
} from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

type Props = {
  disabled: boolean;
  onWithdraw?: () => void;
  onDeposit?: () => void;
};

export const AssetsHeader: FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex justify={"between"}>
      <CardTitle>{t("portfolio.overview.title")}</CardTitle>
      <Flex gap={3}>
        <Button
          disabled={props.disabled}
          size="md"
          color="secondary"
          onClick={() => props.onWithdraw?.()}
          icon={<ArrowUpSquareFillIcon />}
          data-testid="oui-testid-portfolio-assets-withdraw-btn"
        >
          {t("transfer.withdraw")}
        </Button>
        <Button
          disabled={props.disabled}
          size="md"
          onClick={() => props.onDeposit?.()}
          icon={<ArrowDownSquareFillIcon />}
          data-testid="oui-testid-portfolio-assets-deposit-btn"
        >
          {t("transfer.deposit")}
        </Button>
      </Flex>
    </Flex>
  );
};
