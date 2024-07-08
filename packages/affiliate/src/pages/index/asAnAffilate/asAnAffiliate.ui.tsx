import { FC } from "react";
import { Button, Flex, Text } from "@orderly.network/ui";
import { AsAnAffiliateReturns } from "./asAnAffiliate.script";

export const AsAnAffiliateUI: FC<AsAnAffiliateReturns> = () => {
  return <Flex gradient="primary" r={"2xl"} p={6} gap={6} direction={"column"} angle={180} width={"100%"}>
    <Flex height={80} direction={"row"} gap={3} itemAlign={"start"} width={"100%"} justify={"between"}>
        <Flex direction={"column"} itemAlign={"start"} justify={"between"} className="oui-h-full">
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
        <Button variant="contained" color="secondary">Become an affiliate</Button>
        <Flex direction={"column"} justify={"between"} className="oui-h-full" itemAlign={"end"}>
            <Text className="oui-text-base md:oui-text-lg lg:oui-text-xl 2xl:oui-text-2xl">40%-80%</Text>
            <Text className="oui-text-2xs md:oui-text-xs 2xl:oui-text-sm oui-text-base-contrast-54">Commission</Text>
        </Flex>
    </Flex>
  </Flex>;
};

const Icon = () => {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M35.997 5.86c-16.569 0-29.944 13.43-30 30-.056 16.545 13.445 30.06 30 30.093s30.03-13.665 30-30.093c-.03-16.57-13.432-30-30-30m0 6c13.255 0 24 10.746 24 24 0 6.75-2.812 12.834-7.297 17.196-2.209-4.78-6.955-8.196-12.39-8.196h-8.626c-5.432 0-10.164 3.375-12.375 8.157-4.485-4.362-7.312-10.407-7.312-17.157 0-13.254 10.745-24 24-24m0 6c-6.628 0-12 5.373-12 12s5.372 12 12 12c6.627 0 12-5.373 12-12s-5.373-12-12-12"
        fill="#fff"
        fill-opacity=".2"
      />
      <path
        d="M72 57c0 8.284-6.716 15-15 15s-15-6.716-15-15 6.716-15 15-15 15 6.716 15 15"
        fill="#1828C3"
      />
      <path
        d="M53.624 51.45a4.125 4.125 0 0 0-4.125 4.125c0 2.388 1.36 4.641 3.61 6.703a21 21 0 0 0 2.414 1.875c.287.194.556.37.797.516.147.089.243.154.304.187a.79.79 0 0 0 .75 0c.061-.033.158-.098.305-.187.24-.147.51-.322.797-.516a21 21 0 0 0 2.414-1.875c2.25-2.062 3.61-4.315 3.61-6.703a4.125 4.125 0 0 0-4.126-4.125c-1.294 0-2.557.705-3.351 1.734-.775-1.047-2.034-1.734-3.399-1.734"
        fill="#fff"
        fill-opacity=".98"
      />
    </svg>
  );
};
