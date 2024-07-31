import {Box, Button, ExclamationFillIcon, Flex, modal, Text} from "@orderly.network/ui"
import {RefreshIcon} from "../../icons";

interface IProps{
    hasPositions: boolean;
    unsettledPnl: number;
    onSettlle: () =>Promise<any>;
}

export const UnsettlePnlInfo = ({hasPositions, unsettledPnl, onSettlle}: IProps) => {
    if (unsettledPnl=== 0 && !hasPositions) {
        return <></>
    }
    const settlePnlDialog = () => {
        modal.confirm({
            title:'Settle PnL',
            content: <Box>Are you sure you want to settle your PnL?<br/> Settlement will take up to 1 minute before you can withdraw your available balance.</Box>,
            onOk: () => {
                return onSettlle();
            }

        })
    }
   return (
       <Flex justify='between' className='oui-text-2xs oui-text-base-contrast-36 oui-mt-1'>
           <Flex itemAlign='center' justify='start' gap={1}>

               <ExclamationFillIcon size={14} className='oui-text-warning'/>
               <Text>
                   Unsettled:
               </Text>
               <Text.numeral coloring weight="semibold" dp={6} >
                   {unsettledPnl}
               </Text.numeral>
               <Text>USDC</Text>
           </Flex>
           <Flex itemAlign='center' gap={1} className='oui-cursor-pointer'>
               <RefreshIcon/>
               <Text
                   size="2xs"
                   color="primaryLight"
                   className=" oui-select-none"
                   onClick={settlePnlDialog}
               >
                   Settle
               </Text>

           </Flex>
       </Flex>
   )
}