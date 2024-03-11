import { useMediaQuery } from "@orderly.network/hooks";
import { Column, Divider, Table, cn } from "@orderly.network/react";
import { FC, useMemo } from "react";
import { MEDIA_MD } from "../../types/constants";

export const RebateList: FC<{
    className?: string,
    dataSource: any[],
}> = (props) => {


    const isMD = useMediaQuery(MEDIA_MD);
    const dataSource = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    const clsName = "orderly-overflow-y-auto orderly-max-h-[469px] md:orderly-max-h-[531px] lg:orderly-max-h-[350px] xl:orderly-max-h-[320px] 2xl:orderly-max-h-[340px]";
    
    const columns = useMemo<Column[]>(() => {
        return [
            {
                title: "Date",
                dataIndex: "code",
                className: "orderly-h-[44px]",

                render: (value, record) => (
                    <div>
                       {'2024年03月11日17:58:14'}
                    </div>
                )
            },
            {
                title: "Commission (USDC)",
                dataIndex: "referees",
                className: "orderly-h-[44px]",
                render: (value, record) => (
                    <div>
                        32.5% / 17.5%
                    </div>
                )
            },
            {
                title: "Trading vol. (USDC)",
                dataIndex: "referees",
                className: "orderly-h-[44px]",
                align: "right",
                render: (value, record) => (
                    <div >
                        293 / 12
                    </div>
                )
            }
        ];
    }, []);

    if (isMD) {
        return <div className={clsName}>
            {(dataSource.map((item, index) => <SmallCodeCell />))}
        </div>;
    }

   

    return (
        <div className="orderly-h-[300px] orderly-overflow-y-auto orderly-mt-4">
            <Table
            bordered
            justified
            showMaskElement={false}
            columns={columns}
            dataSource={dataSource}
            headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900 orderly-sticky orderly-top-0"
            className={cn(
                "orderly-text-xs 2xl:orderly-text-base",
            )}
            generatedRowKey={(rec, index) => `${index}`}
        />
        </div>

        
    );
}


const SmallCodeCell: FC = (prosp) => {

    return (
        <div>
            <Divider className="orderly-my-3" />
            <div className="orderly-flex orderly-justify-between">
                <div>
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Referral Codes</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">DYOLOVRH</div>
                </div>
                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">You / Referee</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">DYOLOVRH</div>
                </div>

                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Referees / Traders</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">DYOLOVRH</div>
                </div>


            </div>
           
        </div>
    );
}