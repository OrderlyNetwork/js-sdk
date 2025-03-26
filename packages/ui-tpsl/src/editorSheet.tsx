import { useMemo } from "react";
import { AlgoOrderRootType, API } from "@orderly.network/types";
import {
  Flex,
  modal,
  useModal,
  Text,
  Box,
  Badge,
  Divider,
  toast,
} from "@orderly.network/ui";
import { TPSLWidget, TPSLWidgetProps } from "./tpsl.widget";
import { PositionTPSLConfirm } from "./tpsl.ui";
import { useLocalStorage, useMarkPrice } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";

type TPSLSheetProps = {
  position: API.Position;
  order?: API.AlgoOrder;
  // label: string;
  // baseDP?: number;
  // quoteDP?: number;
  symbolInfo: API.SymbolExt;
  isEditing?: boolean;
};

export const PositionTPSLSheet = (props: TPSLWidgetProps & TPSLSheetProps) => {
  const { position, order, symbolInfo, isEditing } = props;
  const { resolve, hide, updateArgs } = useModal();

  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);
  const { t } = useTranslation();

  const isPositionTPSL = isEditing
    ? order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
    : undefined;

  const updateSheetTitle = (title: string) => {
    if (isEditing) return;
    updateArgs({ title });
  };

  const onCompleted = () => {
    resolve();
    hide();
  };

  const { quote_dp, base_dp } = symbolInfo;

  return (
    <>
      <PositionInfo position={position} symbolInfo={symbolInfo} />

      <TPSLWidget
        {...props}
        onTPSLTypeChange={(type) => {
          updateSheetTitle(
            type === AlgoOrderRootType.TP_SL
              ? t("common.tpsl")
              : t("tpsl.positionTpsl")
          );
        }}
        onComplete={onCompleted}
        onConfirm={(order, options) => {
          if (!needConfirm) {
            return Promise.resolve(true);
          }

          const maxQty = Math.abs(Number(position.position_qty));

          const finalIsEditing =
            isEditing ||
            (!!order &&
              order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
              order.quantity === maxQty);

          return modal
            .confirm({
              title: finalIsEditing
                ? t("orders.editOrder")
                : t("tpsl.confirmOrder"),
              bodyClassName: "oui-pb-0 lg:oui-pb-0",
              onOk: () => {
                return options.submit();
              },
              content: (
                <PositionTPSLConfirm
                  isPositionTPSL={isPositionTPSL}
                  isEditing={isEditing}
                  symbol={order.symbol!}
                  qty={Number(order.quantity)}
                  maxQty={maxQty}
                  tpPrice={Number(order.tp_trigger_price)}
                  slPrice={Number(order.sl_trigger_price)}
                  side={order.side!}
                  quoteDP={quote_dp ?? 2}
                  baseDP={base_dp ?? 2}
                />
              ),
            })
            .then(
              () => {
                // setOpen(false);
                // setVisible(true);
                return true;
              },
              (reject) => {
                if (reject?.message) {
                  toast.error(reject.message);
                }

                // setVisible(true);
                return Promise.reject(false);
              }
            );
        }}
        onCancel={() => {
          hide();
        }}
      />
    </>
  );
};

export const TPSLSheetTitle = () => {
  const modal = useModal();
  const { t } = useTranslation();

  const title = useMemo<string>(() => {
    return (modal.args?.title || t("common.tpsl")) as string;
  }, [modal.args?.title, t]);

  return <span>{title}</span>;
};

export const PositionInfo = (props: {
  position: API.Position;
  symbolInfo: API.SymbolExt;
}) => {
  const { position, symbolInfo } = props;
  const { data: markPrice } = useMarkPrice(position.symbol);
  const modal = useModal();
  const { t } = useTranslation();

  const isPositionTPSL = useMemo(() => {
    return modal.args?.title === t("tpsl.positionTpsl");
  }, [modal.args?.title, t]);
  return (
    <>
      <Flex justify={"between"} pb={3} itemAlign={"center"}>
        <Text.formatted rule="symbol" className="oui-text-xs" showIcon>
          {position.symbol}
        </Text.formatted>
        <Flex gapX={1}>
          {isPositionTPSL && (
            <Badge size="xs" color="primary">
              {t("common.position")}
            </Badge>
          )}
          <Badge size="xs" color="neutral">
            {t("common.tpsl")}
          </Badge>
          {position.position_qty < 0 ? (
            <Badge size="xs" color="buy">
              {t("common.buy")}
            </Badge>
          ) : (
            <Badge size="xs" color="sell">
              {t("common.sell")}
            </Badge>
          )}
        </Flex>
      </Flex>
      <Divider intensity={8} />
      <Box py={3} className="oui-space-y-1">
        <Flex justify={"between"}>
          <Text size="sm" intensity={54}>
            {t("common.avgOpen")}
          </Text>
          <Text.numeral
            className="oui-text-xs"
            unit={symbolInfo.quote}
            dp={symbolInfo.quote_dp}
            unitClassName="oui-ml-1 oui-text-base-contrast-36"
          >
            {position.average_open_price}
          </Text.numeral>
        </Flex>
        <Flex justify={"between"}>
          <Text size="sm" intensity={54}>
            {t("common.markPrice")}
          </Text>
          <Text.numeral
            className="oui-text-xs"
            unit={symbolInfo.quote}
            dp={symbolInfo.quote_dp}
            unitClassName="oui-ml-1 oui-text-base-contrast-36"
          >
            {markPrice}
          </Text.numeral>
        </Flex>
      </Box>
    </>
  );
};
