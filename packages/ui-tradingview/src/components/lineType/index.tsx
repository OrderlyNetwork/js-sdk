import React, { useMemo, useState } from "react";
import {
  Box,
  cn,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Switch,
  Text,
} from "@orderly.network/ui";
import {
  AreaIcon,
  BarIcon,
  BaseLineIcon,
  CandlesIcon,
  HollowCandlesIcon,
  IndicatorsIcon,
  LineIcon, LineTypeIcon
} from "../../icons";

const lineTypeList = [
  {
    icon: <BarIcon fill="currentColor" className="oui-w-5 oui-h-5" />,
    label: "Bars",
    value: "0",
  },
  {
    icon: <CandlesIcon fill="currentColor" className="oui-w-5 oui-h-5" />,
    label: "Candles",
    value: "1",
  },
  {
    icon: <HollowCandlesIcon fill="currentColor" className="oui-w-5 oui-h-5" />,
    label: "Hollow candles",
    value: "9",
  },
  {
    icon: <LineIcon fill="currentColor" className="oui-w-5 oui-h-5" />,
    label: "Line",
    value: "2",
  },
  {
    icon: <AreaIcon fill="currentColor" className="oui-w-5 oui-h-5" />,
    label: "Area",
    value: "3",
  },
  {
    icon: <BaseLineIcon fill="currentColor" className="oui-w-5 oui-h-5" />,
    label: "Baseline",
    value: "10",
  },
];

interface IProps {
  lineType: string;
  changeLineType: (type: string) => void;
}
export default function LineType(props:IProps) {
  const [open, setOpen] = useState(false);

  const currentLineTypeIcon = useMemo(() => {
   const data = lineTypeList.find(item => item.value === props.lineType);
   if (data) {

     return data.icon;
   }
   return lineTypeList[1].icon;
  }, [props.lineType])
  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Box className={cn('oui-w-[18px] oui-h-[18px] oui-cursor-pointer oui-text-base-contrast-36 hover:oui-text-base-contrast-80',
          open && 'oui-text-base-contrast-80'
          )} >
          {currentLineTypeIcon}
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          align="start"
          sideOffset={20}
          className="oui-bg-base-8"
        >
          <Flex
            direction="column"
            gap={4}
            px={5}
            py={5}
            width={240}
            justify="start"
            itemAlign="start"
          >
            {lineTypeList.map((item) => (
              <Flex
                key={item.value}
                justify={"start"}
                itemAlign={"center"}
                gap={2}
                className={cn("oui-text-base-contrast-36 oui-cursor-pointer oui-w-full hover:oui-text-base-contrast",
                  props.lineType === item.value && "oui-text-base-contrast"
                )}
                onClick={()=> props.changeLineType(item.value)}
              >
                {item.icon}
                <Text className='oui-text-sm'>
                  {item.label}
                </Text>
              </Flex>
            ))}
          </Flex>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
}
