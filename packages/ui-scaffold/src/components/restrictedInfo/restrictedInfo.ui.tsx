import { FC } from "react";
import { cn, Flex } from "@orderly.network/ui";
import { InfoIcon } from "../icons";
import { UseRestrictedInfoScriptReturn } from "./restrictedInfo.script";
import { useTranslation } from "@orderly.network/i18n";
export type RestrictedInfoProps = UseRestrictedInfoScriptReturn & {
  className?: string;
};

export const RestrictedInfo: FC<RestrictedInfoProps> = (props) => {
  const { brokerName } = props;
  const { ip, content, restrictedOpen } = props.restrictedInfo || {};
  const { t } = useTranslation();

  if (!restrictedOpen) {
    return;
  }

  const renderContent = () => {
    if (typeof content === "function") {
      return <span>{content({ ip: ip!, brokerName })}</span>;
    }
    return (
      content || (
        <span>
          {t("restrictedInfo.description.default", {
            brokerName,
            ip,
          })}
        </span>
      )
    );
  };

  return (
    <Flex
      ref={props.container}
      justify="center"
      className={cn(
        "oui-rounded-xl oui-p-[7px]",
        "oui-text-warning-darken",
        props.className
      )}
    >
      <Flex
        className={cn(
          "oui-min-h-[20px] oui-gap-1",
          "oui-text-2xs md:oui-text-sm oui-leading-4",
          "oui-items-start lg:oui-justify-center",
          props.mutiLine ? "lg:oui-items-start" : "lg:oui-items-center"
        )}
      >
        <InfoIcon
          size={20}
          className="oui-flex-shrink-0 oui-w-4 oui-h-4 lg:oui-w-5 lg:oui-h-5"
        />
        {renderContent()}
      </Flex>
    </Flex>
  );
};
