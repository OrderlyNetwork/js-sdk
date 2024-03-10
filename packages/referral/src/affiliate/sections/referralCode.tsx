import { FC, useMemo } from "react";
import { useMediaQuery } from "../../../../hooks/dist";
import { MEDIA_MD } from "../../types/constants";
import { Button, Column, Divider, Table, cn, toast } from "@orderly.network/react";
import { PinView } from "./pinView";
import { CopyIcon } from "../icons";

export const ReferralCode: FC<{className?:string}> = (props) => {

    return (
        <div className={cn("orderly-px-6 orderly-pt-6 orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-600 orderly-rounded-lg",props.className)}>
            <div className="orderly-flex orderly-items-center orderly-justify-between">
                <div className="orderly-text-base 2xl:orderly-text-lg">Referral codes</div>
                <div className="orderly-flex orderly-text-base-contrast-54 orderly-text-2xs 2xl:orderly-text-xs">
                    Remaining referral codes:&nbsp;
                    <span className="orderly-text-primary">5</span>
                </div>
            </div>


                <CodeList />
        </div>
    );
}

export const CodeList = () => {
    const isMD = useMediaQuery(MEDIA_MD);
    const dataSource = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    const clsName = "orderly-overflow-y-auto orderly-max-h-[469px] md:orderly-max-h-[531px] lg:orderly-max-h-[350px] xl:orderly-max-h-[320px] 2xl:orderly-max-h-[340px]";
    
    const columns = useMemo<Column[]>(() => {
        return [
            {
                title: "Referral Codes",
                dataIndex: "code",
                className: "orderly-h-[44px]",

                render: (value, record) => (
                    <div className="orderly-flex orderly-gap-2 orderly-items-center">
                        <PinView pin={false} />
                        <div>DYOLOVRH</div>
                        <CopyIcon
                            className="orderly-mr-3 orderly-cursor-pointer"
                            onClick={() => { toast.success("will be realized") }}
                        />
                    </div>
                )
            },
            {
                title: "You / Referee",
                dataIndex: "referees",
                className: "orderly-h-[44px]",
                render: (value, record) => (
                    <div>
                        32.5% / 17.5%
                    </div>
                )
            },
            {
                title: "Referees / Traders",
                dataIndex: "referees",
                className: "orderly-h-[44px]",
                align: "right",
                render: (value, record) => (
                    <div >
                        293 / 12
                    </div>
                )
            },
            {
                title: "Actions",
                dataIndex: "referees",
                className: "orderly-h-[44px] orderly-text-right",
                align: "right",
                render: (value, record) => (
                    <div className="orderly-flex orderly-justify-end">
                        <_CopyCode
                            onClick={(event) => {

                            }}
                        />
                    </div>
                )
            },
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
            <div className="orderly-mt-3 orderly-flex orderly-justify-between">
                <PinView pin={false} />
                <_CopyCode
                    onClick={(event) => {

                    }}
                />
            </div>
        </div>
    );
}

const _CopyCode: FC<{ onClick: (event: any) => void }> = (props) => {

    return (
        <Button
            size="small"
            variant={"outlined"}
            className="orderly-text-primary orderly-border-primary"
            onClick={props.onClick}
        >
            Copy code
        </Button>
    );
}