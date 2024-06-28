import { Box, Flex, Text, cn } from "@orderly.network/ui";

import { useState, useEffect, FC } from "react";

export const CurEpochUI: FC = (props) => {
  return (
    <Box r={"2xl"} className="oui-bg-base-9" width={"100%"}>
      <Countdown />
      <Flex p={6} direction={"column"} gap={4}>
        <Flex direction={"row"} gap={3}>
          <Flex px={4} py={2} justify={"between"} direction={"column"}>
            <Text>Epoch</Text>
            <Text>7 Mar.20 - mar.27</Text>
          </Flex>
          <Flex px={4} py={2} justify={"between"} direction={"column"}>
            <Text className="oui-text-base-contrast-54 oui-text-xs md:oui-text-sm">Epoch rewards</Text>
            <Text>7 Mar.20 - mar.27</Text>
          </Flex>
        </Flex>
        <Flex gradient="brand" direction={"column"} gap={3} py={4} width={"100%"} r="2xl">
            <Text>My est. rewards</Text>
            <Flex direction={"row"} gap={1}>
            12,322.12
            </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

const Countdown: FC<{
  targetTimestamp?: number;
}> = ({ targetTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof targetTimestamp === "undefined") return;
      const now = new Date().getTime();
      const distance = targetTimestamp - now;

      if (distance < 0) {
        clearInterval(intervalId);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetTimestamp]);

  const num = (value: string) => {
    return (
      <Text className="oui-text-base-contrast oui-text-sm md:oui-text-base lg:oui-text-lg ">
        {value}
      </Text>
    );
  };

  return (
    <Box
      className="oui-rounded-t-2xl oui-text-base-contrast-54 oui-font-semibold"
      gradient="neutral"
      width={"full"}
    >
      <Flex
        direction={"row"}
        itemAlign={"center"}
        justify={"center"}
        gap={1}
        className="oui-text-2xs md:oui-text-xs lg:oui-text-sm oui-py-[13px]"
      >
        <span>Countdown:</span>
        {num(`${timeLeft.days}`.padStart(2, "0"))}
        <span>D</span>
        {num(`${timeLeft.hours}`.padStart(2, "0"))}
        <span>H</span>
        {num(`${timeLeft.minutes}`.padStart(2, "0"))}
        <span>M</span>
        {num(`${timeLeft.seconds}`.padStart(2, "0"))}
        <span>S</span>
      </Flex>
    </Box>
  );
};
