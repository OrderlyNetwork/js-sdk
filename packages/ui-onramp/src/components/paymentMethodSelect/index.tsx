import { useState } from "react";
import {
  Box,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  ScrollArea,
  Spinner,
  Text,
  cn,
} from "@orderly.network/ui";
import { ExchangeIcon } from "../icons";

export type PaymentMethod = {
  id: string;
  name: string;
  icon?: string;
};

type PaymentMethodSelectProps = {
  methods: PaymentMethod[];
  value: PaymentMethod;
  onValueChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export const PaymentMethodSelect: React.FC<PaymentMethodSelectProps> = (
  props,
) => {
  const { methods, value, disabled, loading } = props;
  const [open, setOpen] = useState(false);

  const selectable = methods.length > 1;

  const renderRightIcon = () => {
    if (selectable) {
      return <ExchangeIcon className="oui-text-base-contrast-54" />;
    }
  };

  const trigger = (
    <Flex
      intensity={500}
      className={cn(
        "oui-rounded-[4px] oui-rounded-t-xl oui-border oui-border-line",
        disabled
          ? "oui-cursor-not-allowed"
          : selectable
            ? "oui-cursor-pointer"
            : "oui-cursor-auto",
        props.className,
      )}
      height={54}
      px={3}
      justify="between"
      itemAlign="center"
    >
      <div>
        <Flex>
          <Text size="2xs" intensity={54}>
            Pay with
          </Text>
        </Flex>
        <Flex gapX={1} itemAlign="center">
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              {value.icon && (
                <img
                  src={value.icon}
                  alt={value.name}
                  width={16}
                  height={16}
                  className="oui-rounded-lg oui-bg-base-contrast oui-object-contain oui-p-px"
                />
              )}
              <Text size="sm" intensity={80}>
                {value.name}
              </Text>
            </>
          )}
        </Flex>
      </div>
      {renderRightIcon()}
    </Flex>
  );

  const content = methods.map((method, index) => {
    const isActive = method.id === value.id;
    return (
      <Flex
        key={method.id}
        px={2}
        r="base"
        justify="between"
        itemAlign="center"
        className={cn(
          "oui-h-[30px] oui-cursor-pointer hover:oui-bg-base-5",
          isActive && "oui-bg-base-5",
          index !== 0 && "oui-mt-[2px]",
        )}
        onClick={() => {
          setOpen(false);
          props.onValueChange(method);
        }}
      >
        <Flex gapX={1} itemAlign="center">
          {method.icon && (
            <img
              src={method.icon}
              alt={method.name}
              width={14}
              height={14}
              className="oui-rounded-lg oui-bg-base-contrast oui-object-contain oui-p-px"
            />
          )}
          <Text size="2xs" intensity={isActive ? 80 : 54}>
            {method.name}
          </Text>
        </Flex>
        {isActive && (
          <Box
            width={4}
            height={4}
            r="full"
            className="oui-bg-[linear-gradient(270deg,#59B0FE_0%,#26FEFE_100%)]"
          />
        )}
      </Flex>
    );
  });

  return (
    <DropdownMenuRoot open={selectable ? open : false} onOpenChange={setOpen}>
      <DropdownMenuTrigger disabled={disabled} asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={2}
          className={cn(
            "oui-z-50 oui-bg-base-8 oui-p-1",
            "oui-w-[var(--radix-dropdown-menu-trigger-width)]",
            "oui-select-none oui-rounded-md",
          )}
        >
          <ScrollArea>
            <div className="oui-max-h-[145px]">{content}</div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
