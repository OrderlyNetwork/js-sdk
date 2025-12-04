import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "@veltodefi/i18n";
import {
  PortfolioLeftSidebarPath,
  SettingModule,
} from "@veltodefi/portfolio";
import { ChevronRightIcon, Flex, Text, useScreen } from "@veltodefi/ui";
import { LanguageSwitcherWidget } from "@veltodefi/ui-scaffold";
import { PortfolioLayout } from "../../../components/layout";

const meta: Meta<typeof SettingModule.SettingPage> = {
  title: "Package/portfolio/Setting",
  component: SettingModule.SettingPage,
  subcomponents: {},
  parameters: {},
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { isDesktop } = useScreen();

    return (
      <PortfolioLayout currentPath={PortfolioLeftSidebarPath.Setting}>
        {/* {isDesktop && (
          <Flex mt={1} mb={2} p={4} intensity={900} r="xl" itemAlign="center">
            <LanguageSwitcherWidget open={open} onOpenChange={setOpen} />

            <Flex
              className="oui-cursor-pointer"
              itemAlign="center"
              width="100%"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Text
                size="base"
                weight="semibold"
                intensity={80}
                className="oui-ml-2"
              >
                {t("languageSwitcher.language")}
              </Text>
              <ChevronRightIcon
                size={18}
                className="oui-ml-auto oui-text-base-contrast-36"
              />
            </Flex>
          </Flex>
        )} */}
        <SettingModule.SettingPage />
      </PortfolioLayout>
    );
  },
};
