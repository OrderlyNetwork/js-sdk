import { useState } from "react";

export type ReferralLinkReturns = {

    onCopy?: (value: string) => void;
    refLink: string,
    refCode: string,
};

export const useReferralLinkScript = (): ReferralLinkReturns => {

    const onCopy = (value: string) => {};
    const [refLink, setRefLink] = useState('"http://localhost:6006/?path=/story/package-affiliate-affiliate--page&globals=viewport:ipad"');
    const [refCode, setRefCode] = useState('ASFDSSD');

    return {
        onCopy,
        refLink,
        refCode,
    };
};
