import { FC } from "react";
import { Button, Flex, Text } from "@orderly.network/ui";
import { AsATraderReturns } from "./asATrader.script";

export const AsATraderUI: FC<AsATraderReturns> = () => {
  return (
    <Flex gradient="success" r={"2xl"} p={6} gap={6} direction={"column"} angle={180} width={"100%"}>
    <Flex height={80} direction={"row"} gap={3} itemAlign={"start"} width={"100%"} justify={"between"}>
        <Flex
          direction={"column"}
          itemAlign={"start"}
          justify={"between"}
          className="oui-h-full"
        >
          <Text className="oui-text-lg md:oui-text-xl lg:oui-text-2xl xl:oui-text-[28px]">
            As an affiliate
          </Text>
          <Text className="oui-text-xs md:oui-text-sm 2xl:oui-text-base oui-text-base-contrast-54">
            Onboard traders to earn passive income
          </Text>
        </Flex>
        <div className="oui-flex-shrink-0">
          <Icon />
        </div>
      </Flex>
      <Flex direction={"row"} justify={"between"} width={"100%"}>
        <Button variant="contained" color="secondary">
          Enter code
        </Button>
        <Flex direction={"column"} justify={"between"} className="oui-h-full" itemAlign={"end"}>
          <Text className="oui-text-base md:oui-text-lg lg:oui-text-xl 2xl:oui-text-2xl">
            0%-20%
          </Text>
          <Text className="oui-text-2xs md:oui-text-xs 2xl:oui-text-sm oui-text-base-contrast-54">
            Rebate
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

const Icon = () => {
  return (
    <svg
      width="90"
      height="90"
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M44.996 7.324c-20.71 0-37.43 16.79-37.5 37.5-.07 20.682 16.806 37.575 37.5 37.617 20.694.04 37.537-17.082 37.5-37.617-.037-20.71-16.79-37.5-37.5-37.5m0 7.5c16.569 0 30 13.433 30 30 0 8.438-3.514 16.043-9.12 21.495-2.762-5.973-8.694-10.245-15.49-10.245h-10.78c-6.791 0-12.706 4.22-15.47 10.197-5.606-5.453-9.14-13.01-9.14-21.447 0-16.567 13.431-30 30-30m0 7.5c-8.284 0-15 6.717-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15"
        fill="#fff"
        fill-opacity=".2"
      />
      <path
        d="M90 71.25C90 81.605 81.605 90 71.25 90S52.5 81.605 52.5 71.25 60.895 52.5 71.25 52.5 90 60.895 90 71.25"
        fill="#005A4F"
      />
      <path
        d="M80.62 75.007c0-.24-.08-.49-.263-.675l-3.487-3.456-1.318 1.318 1.845 1.875H63.745a.938.938 0 0 0 0 1.875h13.652l-1.845 1.875 1.318 1.318 3.487-3.456a.95.95 0 0 0 .263-.674m-.937-7.5a.94.94 0 0 0-.938-.938H65.093l1.846-1.875-1.319-1.318-3.486 3.456a.966.966 0 0 0 0 1.349l3.486 3.456 1.319-1.318-1.846-1.875h13.652c.518 0 .938-.42.938-.937"
        fill="#fff"
        fill-opacity=".98"
      />
    </svg>
  );
};
