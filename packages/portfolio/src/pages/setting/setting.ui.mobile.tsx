import { FC, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Card,
  Flex,
  Switch,
  Text,
  ChevronRightIcon,
} from "@orderly.network/ui";
import { AuthGuardTooltip } from "@orderly.network/ui-connector";
import { LanguageSwitcherWidget } from "@orderly.network/ui-scaffold";
import { SettingScriptReturns } from "./setting.script";

export const SettingMobile: FC<SettingScriptReturns> = (props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const onLanguageChange = () => {
    setOpen(true);
  };

  return (
    <>
      <Flex
        className="oui-flex-row oui-items-center oui-mb-2 oui-p-4 oui-bg-base-9 oui-rounded-xl"
        onClick={onLanguageChange}
      >
        <LanguageSwitcherWidget open={open} setOpen={setOpen} />
        <Text className="oui-text-base oui-font-semibold oui-text-base-contrast-80 oui-ml-2">
          {t("languageSwitcher.language")}
        </Text>
        <ChevronRightIcon
          size={18}
          className="oui-ml-auto oui-text-base-contrast-36"
        />
      </Flex>
      <Card
        // @ts-ignore
        title={
          <div className="oui-text-sm">
            {t("portfolio.setting.systemUpgrade")}
          </div>
        }
        id="portfolio-apikey-manager"
        className="oui-bg-base-9 oui-font-semibold"
        classNames={{ root: "oui-p-4", content: "!oui-pt-3" }}
      >
        <Flex
          direction={"row"}
          gap={4}
          width={"100%"}
          itemAlign={"center"}
          pt={3}
          className="oui-font-semibold oui-border-t-2 oui-border-line-6"
        >
          <Flex
            direction={"column"}
            itemAlign={"start"}
            className="oui-flex-1 oui-gap-2"
          >
            <Text intensity={80} size="xs">
              {t("portfolio.setting.cancelOpenOrders")}
            </Text>
            <Text intensity={36} size="2xs" className="oui-font-normal">
              {t("portfolio.setting.cancelOpenOrders.description")}
            </Text>
            <AuthGuardTooltip>
              <Switch
                className="oui-mt-1"
                checked={props.maintenance_cancel_orders}
                onCheckedChange={(e) => {
                  props.setMaintainConfig(e);
                }}
                disabled={props.isSetting || !props.canTouch}
                data-testid="oui-testid-setting-switch-btn"
              />
            </AuthGuardTooltip>
          </Flex>
        </Flex>
      </Card>
    </>
  );
};
