import type { Meta, StoryObj } from "@storybook/react";
import { i18n, useTranslation } from "@orderly.network/i18n";

const meta: Meta = {
  title: "Package/i18n",
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const I18nInstance: Story = {
  render: () => {
    return (
      <>
        <div>{i18n.t("common.disconnect")}</div>
      </>
    );
  },
};

export const useTranslationHook: Story = {
  render: () => {
    const { t } = useTranslation();

    return (
      <>
        <div>{t("common.mainnet")}</div>
      </>
    );
  },
};
