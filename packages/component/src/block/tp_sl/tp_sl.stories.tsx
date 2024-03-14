import type { Meta, StoryObj } from "@storybook/react";

import { TPForm } from "./tpAndslForm";
import {
  within,
  userEvent,
  waitFor,
  screen,
  fireEvent,
} from "@storybook/testing-library";
import { expect } from "@storybook/jest";

import { PnLMode } from "./pnlInput";

const meta: Meta = {
  title: "Block/TP&SL Form",
  component: TPForm,
  args: {},
  argTypes: {
    onChange: { action: "onChange" },
    onSubmit: { action: "onSubmit" },
  },
};

export default meta;

type Story = StoryObj<typeof TPForm>;

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
