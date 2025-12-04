import React from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Flex, Text, ChevronLeftIcon } from "@veltodefi/ui";
import { AnnouncementCenterPage } from "@veltodefi/ui-notification";
import { BaseLayout } from "../../../components/layout/baseLayout";
import { useRouteContext } from "../../../components/orderlyProvider/rounteProvider";
import { PathEnum } from "../../constant";

const AnnouncementTopBar: React.FC = () => {
  const { t } = useTranslation();
  const { onRouteChange } = useRouteContext();

  const onBack = () => {
    onRouteChange({ href: PathEnum.Root, name: t("common.trading") });
  };

  return (
    <Flex
      width={"100%"}
      height={44}
      px={3}
      direction={"row"}
      itemAlign={"center"}
      justify={"center"}
      className="oui-relative"
    >
      <ChevronLeftIcon
        className="oui-absolute oui-left-6 oui-text-base-contrast-54"
        onClick={onBack}
      />
      <Text className="oui-text-base oui-font-bold oui-text-base-contrast">
        {t("notification.centerTitle")}
      </Text>
    </Flex>
  );
};

export default function AnnouncementPage() {
  return (
    <BaseLayout
      topBar={<AnnouncementTopBar />}
      classNames={{
        bottomNav: "oui-hidden",
      }}
    >
      <AnnouncementCenterPage />
    </BaseLayout>
  );
}
