import type { Meta, StoryObj } from "@storybook/react-vite";
import { i18n, Trans, useTranslation } from "@veltodefi/i18n";

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
        <div>{i18n.t("connector.disconnect")}</div>
      </>
    );
  },
};

export const useTranslationHook: Story = {
  render: () => {
    const { t } = useTranslation();

    return (
      <>
        <div>{t("connector.mainnet")}</div>
      </>
    );
  },
};

export const TransComponent: Story = {
  render: () => {
    return (
      <>
        <Trans
          i18nKey="order.edit.confirm.quantity"
          values={{ base: "ETH", value: "100" }}
          components={[<span key="0" className="oui-text-warning-darken" />]}
        />
      </>
    );
  },
};
