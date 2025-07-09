import { FC, SVGProps, useMemo } from "react";
import {
  findTPSLFromOrder,
  findTPSLOrderPriceFromOrder,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { positions as perpPositions } from "@orderly.network/perp";
import { API } from "@orderly.network/types";
import { Button, Flex, Text, Tooltip } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useTPSLDetailContext } from "./tpslDetailProvider";

export const useColumn = () => {
  const { t } = useTranslation();
  const columns = useMemo(() => {
    return [
      {
        title: "Qty.",
        dataIndex: "quantity",
        width: 70,
        className: "oui-pl-5 oui-py-2",
        render: (_: string, record: API.AlgoOrder) => {
          const { position, base_dp } = useTPSLDetailContext();
          const { tp_trigger_price, sl_trigger_price } =
            findTPSLFromOrder(record);
          const { position_qty } = position;
          return (
            <Flex
              direction={"column"}
              justify={"start"}
              itemAlign={"start"}
              className="oui-text-2xs oui-h-full"
            >
              <FlexCell>
                <Text.numeral
                  dp={base_dp}
                  rm={Decimal.ROUND_DOWN}
                  padding={false}
                >
                  {record.quantity === 0
                    ? position.position_qty
                    : record.quantity}
                </Text.numeral>
              </FlexCell>
              {tp_trigger_price && sl_trigger_price && (
                <FlexCell>
                  <div />
                </FlexCell>
              )}
            </Flex>
          );
        },
      },
      {
        title: "Type",
        dataIndex: "type",
        width: 40,
        className: "oui-pl-1 oui-py-2",
        render: (_: string, record: API.AlgoOrder) => {
          const { tp_trigger_price, sl_trigger_price } =
            findTPSLFromOrder(record);

          return (
            <Flex
              direction={"column"}
              justify={"between"}
              itemAlign={"start"}
              className="oui-text-2xs"
            >
              {tp_trigger_price && (
                <FlexCell>
                  <Text className="oui-text-trade-profit">TP</Text>
                </FlexCell>
              )}

              {sl_trigger_price && (
                <FlexCell>
                  <Text className="oui-text-trade-loss">SL</Text>
                </FlexCell>
              )}
            </Flex>
          );
        },
      },
      {
        title: "trigger",
        dataIndex: "trigger",
        width: 80,
        className: "oui-pl-1 oui-py-2",
        render: (_: string, record: API.AlgoOrder) => {
          const { base_dp } = useTPSLDetailContext();
          const { tp_trigger_price, sl_trigger_price } =
            findTPSLFromOrder(record);

          return (
            <Flex
              gap={1}
              direction={"column"}
              justify={"between"}
              itemAlign={"start"}
              className="oui-text-2xs"
            >
              {tp_trigger_price && (
                <FlexCell>
                  <Flex
                    direction={"column"}
                    justify={"start"}
                    itemAlign={"start"}
                  >
                    <Text className="oui-text-base-contrast-36">Market</Text>
                    <Text.numeral
                      dp={base_dp}
                      rm={Decimal.ROUND_DOWN}
                      padding={false}
                    >
                      {tp_trigger_price}
                    </Text.numeral>
                  </Flex>
                </FlexCell>
              )}
              {sl_trigger_price && (
                <FlexCell>
                  <Flex
                    direction={"column"}
                    justify={"start"}
                    itemAlign={"start"}
                  >
                    <Text className="oui-text-base-contrast-36">Market</Text>
                    <Text.numeral
                      dp={base_dp}
                      rm={Decimal.ROUND_DOWN}
                      padding={false}
                    >
                      {sl_trigger_price}
                    </Text.numeral>
                  </Flex>
                </FlexCell>
              )}
            </Flex>
          );
        },
      },
      {
        title: "price",
        dataIndex: "price",
        width: 80,
        className: "oui-pl-1 oui-py-2",
        render: (_: string, record: API.AlgoOrder) => {
          const { tp_order_price, sl_order_price } =
            findTPSLOrderPriceFromOrder(record);
          return (
            <Flex
              gap={2}
              direction={"column"}
              justify={"between"}
              itemAlign={"start"}
              className="oui-text-2xs"
            >
              {tp_order_price && (
                <FlexCell>
                  <Text>{tp_order_price}</Text>
                </FlexCell>
              )}
              {sl_order_price && (
                <FlexCell>
                  <Text>{sl_order_price}</Text>
                </FlexCell>
              )}
            </Flex>
          );
        },
      },

      {
        title: (
          <Tooltip
            className="oui-max-w-[280px] oui-bg-base-8 oui-p-3 oui-text-2xs oui-text-base-contrast"
            content="The actual value may differ based on the actual trading price. This value is only for reference."
          >
            <Text className="oui-underline oui-decoration-dashed oui-underline-offset-2">
              Est.Pnl
            </Text>
          </Tooltip>
        ),
        dataIndex: "estpnl",
        width: 70,
        className: "oui-pl-1 oui-py-2",
        render: (_: string, record: API.AlgoOrder) => {
          const { position, base_dp, quote_dp } = useTPSLDetailContext();
          const { tp_trigger_price, sl_trigger_price } =
            findTPSLFromOrder(record);

          let tp_unrealPnl = undefined;
          let sl_unrealPnl = undefined;
          const qty = new Decimal(record.quantity).eq(0)
            ? position.position_qty
            : record.quantity;
          if (tp_trigger_price) {
            tp_unrealPnl = new Decimal(
              perpPositions.unrealizedPnL({
                qty,
                openPrice: position?.average_open_price,
                // markPrice: unRealizedPrice,
                markPrice: tp_trigger_price,
              }),
            )
              .abs()
              .toNumber();
          }

          if (sl_trigger_price) {
            sl_unrealPnl = new Decimal(
              perpPositions.unrealizedPnL({
                qty: qty,
                openPrice: position?.average_open_price,
                // markPrice: unRealizedPrice,
                markPrice: sl_trigger_price,
              }),
            )
              .abs()
              .mul(-1)
              .toNumber();
          }
          return (
            <Flex
              gap={2}
              direction={"column"}
              justify={"between"}
              itemAlign={"start"}
              className="oui-text-2xs"
            >
              {tp_unrealPnl && (
                <FlexCell>
                  <Text.numeral
                    dp={quote_dp}
                    rm={Decimal.ROUND_DOWN}
                    coloring
                    padding={false}
                  >
                    {tp_unrealPnl}
                  </Text.numeral>
                </FlexCell>
              )}
              {sl_unrealPnl && (
                <FlexCell>
                  <Text.numeral
                    dp={quote_dp}
                    rm={Decimal.ROUND_DOWN}
                    coloring
                    padding={false}
                  >
                    {sl_unrealPnl}
                  </Text.numeral>
                </FlexCell>
              )}
            </Flex>
          );
        },
      },
      {
        title: "",
        dataIndex: "delete",
        width: 50,
        className: "oui-pl-1 oui-pr-5 oui-py-2",
        render: (_, record: API.AlgoOrder) => {
          return (
            <DeleteIcon
              className="oui-text-base-contrast-54 hover:oui-text-base-contrast oui-cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                console.log("delete");
              }}
            />
          );
        },
      },
    ];
  }, [t]);
  return columns;
};

export const FlexCell = (props: { children: React.ReactNode }) => {
  return (
    <Flex
      direction={"column"}
      justify={"center"}
      itemAlign={"start"}
      className="oui-text-2xs oui-h-[36px]"
    >
      {props.children}
    </Flex>
  );
};

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}
const DeleteIcon: FC<IconProps> = (props) => {
  const { size = 18 } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="currentColor"
      {...props}
    >
      <path d="M5.48081 15.375C5.10681 15.375 4.78731 15.2426 4.52231 14.9777C4.25744 14.7127 4.125 14.3932 4.125 14.0192V4.50004H3.375V3.37505H6.75V2.71167H11.25V3.37505H14.625V4.50004H13.875V14.0192C13.875 14.3981 13.7438 14.7188 13.4813 14.9813C13.2188 15.2438 12.8981 15.375 12.5192 15.375H5.48081ZM12.75 4.50004H5.25V14.0192C5.25 14.0866 5.27162 14.1419 5.31487 14.1852C5.35812 14.2284 5.41344 14.25 5.48081 14.25H12.5192C12.5769 14.25 12.6298 14.226 12.6778 14.1779C12.7259 14.1299 12.75 14.077 12.75 14.0192V4.50004ZM7.053 12.75H8.17781V6.00004H7.053V12.75ZM9.82219 12.75H10.947V6.00004H9.82219V12.75Z" />
    </svg>
  );
};
