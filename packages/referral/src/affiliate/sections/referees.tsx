import { useMediaQuery } from "@orderly.network/hooks";
import { Column, Divider, Table, cn } from "@orderly.network/react";
import { EmptyView } from "@orderly.network/react";
import { FC, useMemo } from "react";
import { MEDIA_LG, MEDIA_MD } from "../../types/constants";

export const RefereesList: FC<{
    date: string,
    dataSource: any[]
}> = (props) => {

    const isMD = useMediaQuery(MEDIA_MD);
    const { date, dataSource } = props;

    return isMD ?
        <_SmallReferees date={date} dataSource={dataSource} /> :
        <_BigReferees date={date} dataSource={dataSource} />
}

const _SmallReferees: FC<{
    date: string,
    dataSource: any[]
}> = (props) => {

    const { date, dataSource } = props;
    const content = useMemo(() => {
        if (dataSource.length === 0) {
            return (<EmptyView />);
        }

        return dataSource.map(() => <RefereesCell address="0x8Dd04...b1b88" code="$1,233.22" vol="2222" totalCommission="	$1,153.64" />);
    }, [dataSource]);
    return (

        <div className="orderly-h-[197px] orderly-overflow-auto">
            <div className="orderly-mt-1 orderly-px-4 orderly-py-2 sm:orderly-flex orderly-items-center md:orderly-hidden orderly-text-3xs orderly-text-base-contrast-36">{date}</div>
            {content}
        </div>
    );
}

const _BigReferees: FC<{
    date: string,
    dataSource: any[]
}> = (props) => {
    const { date, dataSource } = props;

    const columns = useMemo<Column[]>(() => {
        return [
            {
                title: "Referee address",
                dataIndex: "date",
                className: "orderly-h-[64px]",

                render: (value, record) => (
                    <div className="orderly-flex orderly-gap-2 orderly-items-center">
                        0x8Dd04...b1b88
                    </div>
                )
            },
            {
                title: "Referral code",
                dataIndex: "Referees",
                align: "left",
                className: "orderly-h-[64px]",
                render: (value, record) => (
                    <div>
                        Carbo
                    </div>
                )
            },
            {
                title: "Total commission (USDC)",
                dataIndex: "vol",
                className: "orderly-h-[64px]",
                align: "right",
                render: (value, record) => (
                    <div >
                        $1,153.64
                    </div>
                )
            },
            {
                title: "Total vol. (USDC)",
                dataIndex: "vol",
                className: "orderly-h-[64px]",
                align: "right",
                render: (value, record) => (
                    <div >
                        $1,153.64
                    </div>
                )
            },
        ];
    }, []);

    return (
        <div className="orderly-h-[300px] orderly-overflow-y-auto orderly-mt-4 orderly-px-3">
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

export const RefereesCell: FC<{
    address: string,
    code: string,
    totalCommission: string,
    vol: string,
}> = (props) => {

    const { address, code, vol, totalCommission } = props;

    return (
        <div className="orderly-my-3 orderly-px-3">
            <div className="orderly-flex orderly-justify-between">
                <div>
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Referee address</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{address}</div>
                </div>
                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">{`Referral code`}</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{code}</div>
                </div>


            </div>
            <div className="orderly-mt-3 orderly-flex orderly-justify-between">
                <div>
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Total commission (USDC)</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{totalCommission}</div>
                </div>
                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">{`Referral vol. (USDC)`}</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{vol}</div>
                </div>


            </div>
            <Divider className="orderly-mt-3" />
        </div>
    );
}