import { useTranslation } from "@veltodefi/i18n";
import { Button } from "@veltodefi/ui";
import { FaucetState } from "./faucet.script";

export function FaucetUi(props: FaucetState) {
  const { t } = useTranslation();

  if (!props.showFaucet) {
    return null;
  }

  return (
    <Button
      variant="outlined"
      fullWidth
      size="md"
      onClick={props.getFaucet}
      loading={props.loading}
      className="oui-text-primary-light oui-border-primary-light oui-rounded"
      data-testid="oui-testid-assetView-getFaucet-button"
    >
      {t("trading.faucet.getTestUSDC")}
    </Button>
  );
}
