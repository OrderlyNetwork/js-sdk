import { FC, RefObject, useRef, useState } from "react";
import {
  Box,
  CaretDownIcon,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  ScrollArea,
  Text,
  cn,
} from "@orderly.network/ui";

export type OnrampPartner = {
  id: string;
  name: string;
  rate: number;
  payout: number;
  recommendations?: string[];
};

type PartnerSelectProps = {
  partners: OnrampPartner[];
  value: OnrampPartner;
  onValueChange: (partner: OnrampPartner) => void;
  containerRef?: RefObject<HTMLElement | null>;
};

export const PartnerSelect: FC<PartnerSelectProps> = ({
  partners,
  value,
  onValueChange,
  containerRef,
}) => {
  const [open, setOpen] = useState(false);
  const selectable = partners.length > 1;
  const triggerRef = useRef<HTMLDivElement>(null);

  const getAlignOffset = () => {
    if (!containerRef?.current || !triggerRef.current) return 0;
    const containerRect = containerRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    return triggerRect.right - containerRect.right;
  };

  return (
    <DropdownMenuRoot open={selectable ? open : false} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Flex
          ref={triggerRef}
          itemAlign="center"
          gap={1}
          className="oui-cursor-pointer oui-select-none"
        >
          <Text size="2xs" intensity={54} weight="semibold">
            by
          </Text>
          <img
            alt={value.name}
            src={`https://cdn.onramper.com/icons/onramps/${value.id.toLowerCase()}-colored.svg`}
            className="oui-size-4 oui-rounded-full oui-object-cover"
          />
          <Text size="2xs" intensity={54} weight="semibold">
            {value.name}
          </Text>
          {selectable && (
            <CaretDownIcon
              size={10}
              className="oui-text-base-contrast-54"
              opacity={1}
            />
          )}
        </Flex>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e: Event) => e.preventDefault()}
          align="end"
          sideOffset={10}
          alignOffset={getAlignOffset()}
          className={cn(
            "oui-z-50 oui-bg-base-8 oui-p-1",
            "oui-min-w-[270px] oui-select-none oui-rounded-[6px]",
            "oui-border oui-border-line-6",
          )}
          style={
            containerRef?.current
              ? { width: containerRef.current.offsetWidth }
              : undefined
          }
        >
          <ScrollArea>
            <div className="oui-flex oui-max-h-[220px] oui-flex-col oui-gap-1">
              {partners.map((partner) => {
                const isActive = partner.id === value.id;
                const diffPercentage =
                  value.payout === 0
                    ? 0
                    : ((partner.payout - value.payout) / value.payout) * 100;

                return (
                  <Flex
                    key={partner.id}
                    p={2}
                    justify="between"
                    itemAlign="center"
                    className={cn(
                      "oui-min-h-[56px] oui-cursor-pointer oui-rounded-[4px] oui-transition-colors hover:oui-bg-base-6",
                      isActive ? "oui-bg-base-5" : "oui-bg-transparent",
                    )}
                    onClick={() => {
                      onValueChange(partner);
                      setOpen(false);
                    }}
                  >
                    {/* Left side */}
                    <Flex
                      direction="column"
                      itemAlign="start"
                      justify="center"
                      gap={1}
                      className="oui-flex-[3]"
                    >
                      <Flex gap={1} itemAlign="center">
                        <img
                          alt={partner.name}
                          src={`https://cdn.onramper.com/icons/onramps/${partner.id.toLowerCase()}-colored.svg`}
                          className="oui-size-4 oui-rounded-full oui-object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://cdn.onramper.com/icons/tokens/usdc.svg";
                          }}
                        />
                        <Text
                          size="sm"
                          intensity={54}
                          weight="semibold"
                          className="oui-leading-5 oui-tracking-[0.42px]"
                        >
                          {partner.name}
                        </Text>
                      </Flex>
                      {partner.recommendations &&
                        partner.recommendations.length > 0 && (
                          <Box>
                            <Flex className="oui-flex-wrap oui-gap-1">
                              {partner.recommendations.map((rec, i) => (
                                <Flex
                                  key={i}
                                  px={1}
                                  py={1}
                                  className={cn(
                                    "oui-rounded-[4px] oui-bg-gradient-to-r",
                                    "oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)]",
                                    "oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)]",
                                  )}
                                >
                                  <Text.gradient
                                    size="3xs"
                                    weight="semibold"
                                    color="brand"
                                    className="oui-leading-[10px] oui-tracking-[0.3px]"
                                  >
                                    {rec}
                                  </Text.gradient>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                        )}
                    </Flex>

                    {/* Right side */}
                    <Flex
                      direction="column"
                      itemAlign="end"
                      justify="center"
                      gap={1}
                      className="oui-flex-[2] oui-text-xs oui-font-semibold oui-tracking-[0.36px]"
                    >
                      {isActive ? (
                        <>
                          <Text
                            intensity={36}
                            className="oui-text-right oui-leading-[15px]"
                          >
                            You receive
                          </Text>
                          <Text intensity={98} className="oui-leading-[15px]">
                            {partner.payout.toFixed(2)} USDC
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text intensity={54} className="oui-leading-[15px]">
                            {partner.payout.toFixed(2)} USDC
                          </Text>
                          <Text
                            className={cn(
                              "oui-text-right oui-leading-[15px]",
                              diffPercentage < 0
                                ? "oui-text-danger"
                                : diffPercentage > 0
                                  ? "oui-text-success"
                                  : "oui-text-base-contrast-54",
                            )}
                          >
                            {diffPercentage > 0 ? "+" : ""}
                            {diffPercentage.toFixed(2)}%
                          </Text>
                        </>
                      )}
                    </Flex>
                  </Flex>
                );
              })}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
