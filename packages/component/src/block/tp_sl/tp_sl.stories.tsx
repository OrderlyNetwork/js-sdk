import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { TPSLForm } from "./tpAndslForm";
import {
  within,
  userEvent,
  waitFor,
  screen,
  fireEvent,
} from "@storybook/testing-library";
import { expect } from "@storybook/jest";

import { PnLMode } from "./pnlInput";

import { useTaskProfitAndStopLoss } from "@orderly.network/hooks";

const meta: Meta = {
  title: "Block/TPSL/TP&SL Form",
  component: TPSLForm,
  args: {},
  argTypes: {
    onChange: { action: "onChange" },
    onSubmit: { action: "onSubmit" },
  },
};

export default meta;

type Story = StoryObj<typeof TPSLForm>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    //

    const tp_pnl = await canvas.findByTestId("tpEstPnL");

    expect(tp_pnl).toHaveTextContent("est. PNL: -");

    const sl_pnl = await canvas.findByTestId("slEstPnL");

    expect(sl_pnl).toHaveTextContent("est. PNL: -");

    // check mode if store in local storage

    await step("check pnl mode store in local storage", async () => {
      const prevMode = localStorage.getItem("TP/SL_Mode");

      if (typeof prevMode === "string") {
        const currentMode = await canvas.getAllByLabelText(
          JSON.parse(prevMode)
        );

        expect(currentMode).toHaveLength(2);
      }
    });

    await step("change pnl mode", async () => {
      userEvent.click(await canvas.findByTestId("TP_dropdown_btn"));

      await waitFor(
        () => {
          userEvent.click(screen.getByTestId("PNL_menu_item"));
        },
        {
          timeout: 3000,
        }
      );

      await waitFor(
        async () => {
          const currentMode = await canvas.getAllByLabelText("PNL");

          expect(currentMode).toHaveLength(2);
        },
        {
          timeout: 1000,
        }
      );
    });

    // input sl price

    //sleep
    await waitFor(
      async () => {
        await new Promise((r) => setTimeout(r, 1000));
      },
      { timeout: 3000 }
    );

    // input quantity

    await step("input order quantity", async () => {
      const input = canvas.getByTestId("order-quantity");
      await userEvent.clear(input);
      // fireEvent.change(canvas.getByTestId("order-quantity"), {
      //   target: {
      //     value: "1.23",
      //   },
      // });

      await userEvent.type(input, "1.2356");
    });

    // input tp price

    await step("input TP price", async () => {
      const tpPrice = await canvas.findByTestId("tp-price-input");

      await userEvent.clear(tpPrice);

      await userEvent.type(tpPrice, "75000");
    });

    await step("input SL price", async () => {
      // clean value;
      await userEvent.type(
        await canvas.findByTestId("sl-price-input"),
        "75000"
      );
    });
  },
  args: {
    maxQty: 2.12,
    symbol: "PERP_BTC_USDC",
    order: {
      quantity: 1.2,
    },
  },
};

export const WithHooks: Story = {
  render: () => {
    const positon = {
      symbol: "PERP_BTC_USDC",
      position_qty: 0.01737,
      cost_position: 1183.642321,
      last_sum_unitary_funding: 5749.6,
      pending_long_qty: 0,
      pending_short_qty: 0,
      settle_price: 68142.90852044,
      average_open_price: 68549.7,
      unsettled_pnl: 8.893292,
      mark_price: 68654.9,
      est_liq_price: 0,
      timestamp: 1710488695826,
      imr: 0.1,
      mmr: 0.025,
      IMR_withdraw_orders: 0.1,
      MMR_with_orders: 0.025,
      pnl_24_h: 0.828036,
      fee_24_h: 2.534924,
    };
    const [order, { setValue, submit }] = useTaskProfitAndStopLoss(positon);
    return (
      <TPSLForm
        symbol={"PERP_BTC_USDC"}
        onChange={setValue}
        maxQty={positon.position_qty}
        onSubmit={submit}
        order={order}
      />
    );
  },
};
