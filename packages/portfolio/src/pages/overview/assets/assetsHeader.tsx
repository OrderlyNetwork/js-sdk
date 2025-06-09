import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  ArrowDownSquareFillIcon,
  ArrowUpSquareFillIcon,
  Button,
  CardTitle,
  Flex,
} from "@orderly.network/ui";

type Props = {
  disabled: boolean;
  onWithdraw?: () => void;
  onDeposit?: () => void;
  onTransfer?: () => void;
  isMainAccount?: boolean;
};

export const AssetsHeader: FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex justify={"between"}>
      <CardTitle>{t("common.overview")}</CardTitle>
      {props.isMainAccount ? (
        <Flex gap={3}>
          <Button
            disabled={props.disabled}
            size="md"
            color="secondary"
            onClick={() => props.onWithdraw?.()}
            icon={<ArrowUpSquareFillIcon />}
            data-testid="oui-testid-portfolio-assets-withdraw-btn"
          >
            {t("common.withdraw")}
          </Button>
          <Button
            disabled={props.disabled}
            size="md"
            onClick={() => props.onDeposit?.()}
            icon={<ArrowDownSquareFillIcon />}
            data-testid="oui-testid-portfolio-assets-deposit-btn"
          >
            {t("common.deposit")}
          </Button>
        </Flex>
      ) : (
        <Button
          disabled={props.disabled}
          size="md"
          color="secondary"
          onClick={() => props.onTransfer?.()}
        >
          {t("common.transfer")}
        </Button>
      )}
    </Flex>
  );
};
