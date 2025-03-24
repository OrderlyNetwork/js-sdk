import {
  ExclamationFillIcon,
  Flex,
  modal,
  Text,
  Tooltip,
} from "@orderly.network/ui";
import { RefreshIcon } from "../../icons";
import { Trans, useTranslation } from "@orderly.network/i18n";
interface IProps {
  hasPositions: boolean;
  unsettledPnl: number;
  onSettlle: () => Promise<any>;
}

export const UnsettlePnlInfo = ({
  hasPositions,
  unsettledPnl,
  onSettlle,
}: IProps) => {
  const { t } = useTranslation();

  if (unsettledPnl === 0 && !hasPositions) {
    return <></>;
  }
  const settlePnlDialog = () => {
    modal.confirm({
      title: t("settle.settlePnl"),
      // @ts-ignore
      content: <Trans i18nKey="settle.settlePnl.description" />,
      onOk: () => {
        return onSettlle();
      },
    });
  };
  return (
    <Flex
      justify="between"
      className="oui-text-2xs oui-text-base-contrast-36 oui-mt-1 oui-mx-2"
    >
      <Flex itemAlign="center" justify="start" gap={1}>
        <Tooltip
          className="oui-max-w-[274px]"
          content={t("settle.unsettled.tooltip")}
        >
          <Flex itemAlign="center" justify="start" gap={1}>
            <ExclamationFillIcon
              size={14}
              className="oui-text-warning-darken"
            />
            <Text className="oui-border-dashed oui-border-b oui-border-line-12 oui-cursor-pointer">
              {`${t("settle.unsettled")}:`}
            </Text>
          </Flex>
        </Tooltip>
        <Text.numeral
          showIdentifier
          coloring
          weight="semibold"
          dp={6}
          data-testid="oui-testid-withdraw-dialog-unsettledPnl-value"
        >
          {unsettledPnl}
        </Text.numeral>
        <Text>USDC</Text>
      </Flex>
      <Flex itemAlign="center" gap={1} className="oui-cursor-pointer">
        <RefreshIcon className="oui-text-primary" />
        <Text
          data-testid="oui-testid-withdraw-dialog-settle-text"
          size="2xs"
          color="primary"
          className=" oui-select-none"
          onClick={settlePnlDialog}
        >
          {t("settle.title")}
        </Text>
      </Flex>
    </Flex>
  );
};
