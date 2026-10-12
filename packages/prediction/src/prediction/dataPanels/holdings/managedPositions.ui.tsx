import { useTranslation } from "@orderly.network/i18n";
import { Badge, Button, formatAddress, Text } from "@orderly.network/ui";
import { HoldingsTable } from "./holdingsTable.widget";
import type { useManagedPositionsScript } from "./managedPositions.script";

export function ManagedPositionsUI(
  props: ReturnType<typeof useManagedPositionsScript>,
) {
  const { t } = useTranslation();
  const groups = props.grouped
    ? [
        {
          id: props.mainAccountId!,
          label: (
            <Badge color="neutral" size="xs">
              {t("common.mainAccount")}
            </Badge>
          ),
        },
        ...props.subAccounts.map((account) => ({
          id: account.id,
          label: (
            <Badge color="neutral" size="xs">
              {account.description || formatAddress(account.id)}
            </Badge>
          ),
        })),
      ]
    : undefined;
  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col">
      {props.error && (
        <div
          role="alert"
          className="oui-flex oui-items-center oui-gap-2 oui-py-2"
        >
          <Text size="xs" color="danger">
            {t("prediction.message.aggregatePositionsFailed")}
          </Text>
          <Button size="sm" variant="outlined" onClick={() => props.retry()}>
            {t("common.refresh")}
          </Button>
        </div>
      )}
      <div className="oui-min-h-0 oui-flex-1">
        <HoldingsTable
          state={props.state}
          groups={groups}
          loading={props.loading}
          getPositionState={props.getPositionState}
          onSubmitted={props.onSubmitted}
        />
      </div>
    </div>
  );
}
