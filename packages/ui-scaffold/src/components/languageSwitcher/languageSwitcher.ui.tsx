import {
  cn,
  Flex,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  CloseIcon,
  Text,
  Divider,
  Box,
} from "@orderly.network/ui";
import { FC, SVGProps } from "react";
import {
  LanguageSwitcherScriptReturn,
  Language,
} from "./languageSwitcher.script";
import { useTranslation } from "@orderly.network/i18n";

type LanguageSwitcherProps = LanguageSwitcherScriptReturn;

export const LanguageSwitcher: FC<LanguageSwitcherProps> = (props) => {
  const { t } = useTranslation();

  const trigger = (
    <div>
      <LanguageIcon
        className={cn(
          "oui-w-6 oui-h-6 lg:oui-w-5 lg:oui-h-5",
          "oui-text-base-contrast-80 oui-cursor-pointer"
        )}
      />
    </div>
  );

  const header = (
    <Flex justify="between" className="oui-h-[46px]">
      <Text>{t("scaffold.languageSwitcher.title")}</Text>
      <CloseIcon
        size={16}
        opacity={1}
        className="oui-text-base-contrast oui-cursor-pointer"
        onClick={props.hide}
      />
    </Flex>
  );

  const context = (
    <Box
      r="2xl"
      py={5}
      className={cn(
        "oui-grid oui-grid-cols-1 oui-gap-1",
        "oui-grid-cols-2 lg:oui-grid-cols-4"
      )}
    >
      {props.languages.map((item) => {
        const selected = props.selectedLang === item.lang;
        return (
          <LanguageItem
            key={item.lang}
            selected={selected}
            item={item}
            onClick={() => props.onLangChange(item.lang)}
          />
        );
      })}
    </Box>
  );

  return (
    <DropdownMenuRoot open={props.open} onOpenChange={props.onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          sideOffset={10}
          collisionPadding={{ right: 16 }}
          className={cn(
            "oui-w-[320px] lg:oui-w-[600px]",
            "oui-bg-base-8 oui-px-5 oui-py-0 oui-rounded-xl",
            "oui-border oui-border-line-6",
            "oui-font-semibold"
          )}
        >
          {header}
          <Divider />
          {context}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

export const LanguageItem = (props: {
  selected: boolean;
  item: Language;
  onClick?: () => void;
}) => {
  const { item } = props;
  return (
    <button
      className={cn(
        "oui-group oui-rounded-md hover:oui-bg-base-5",
        props.selected && "oui-bg-base-5"
      )}
      onClick={props.onClick}
    >
      <Flex justify="between" className="oui-h-10" px={3}>
        <Flex itemAlign="center" width="100%" className="oui-gap-x-[6px]">
          <Text
            size="2xs"
            className={cn(
              "oui-text-base-contrast-36 group-hover:oui-text-base-contrast-80",
              props.selected && "oui-text-base-contrast-80"
            )}
          >
            {item.displayName}
          </Text>
        </Flex>
        {props.selected && (
          <Box gradient="brand" r="full" width={4} height={4} />
        )}
      </Flex>
    </button>
  );
};

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const LanguageIcon: FC<IconProps> = (props) => {
  const { size = 20, viewBox, ...rest } = props;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M10 1.678a8.333 8.333 0 1 0 0 16.667 8.333 8.333 0 1 0 0-16.667m0 1.667c1.1 0 2.308 2.527 2.492 5.831l-4.975.01c.183-3.304 1.382-5.84 2.482-5.84m-2.943.67c-.717 1.393-1.1 3.242-1.193 5.165L3.38 9.174c.248-2.271 1.778-4.176 3.676-5.159m5.889.003c1.898.983 3.388 2.835 3.676 5.168l-2.483-.008c-.078-2-.52-3.758-1.193-5.16m-9.56 6.83 2.483-.02c.092 1.923.478 3.803 1.191 5.182a6.79 6.79 0 0 1-3.674-5.162m4.118.007 4.975-.01c-.184 3.303-1.38 5.833-2.48 5.833s-2.312-2.519-2.495-5.823m6.64-.008 2.471-.008c-.287 2.208-1.68 4.18-3.672 5.162.74-1.53 1.108-3.23 1.2-5.154" />
    </svg>
  );
};
