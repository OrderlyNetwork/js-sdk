export declare namespace API {

    export interface ReferralInfo {
        referrer_info: ReferrerInfo,
        referee_info: RefereeInfo,
    }

    export type ReferrerInfo = {
        "total_invites": number,
        "total_traded": number,
        "total_referee_volume": number,
        "total_referee_fee": number,
        "referral_codes": any[],
        "total_referrer_rebate": number,
        "1d_invites": number,
        "7d_invites": number,
        "30d_invites": number,
        "1d_traded": number,
        "7d_traded": number,
        "30d_traded": number,
        "1d_referee_volume": number,
        "7d_referee_volume": number,
        "30d_referee_volume": number,
        "1d_referee_fee": number,
        "7d_referee_fee": number,
        "30d_referee_fee": number,
        "1d_referrer_rebate": number,
        "7d_referrer_rebate": number,
        "30d_referrer_rebate": number
    }

    export type RefereeInfo = {
        "referer_code"?: string,
        "referee_rebate_rate": any,
        "1d_referee_rebate": number,
        "7d_referee_rebate": number,
        "30d_referee_rebate": number,
        "total_referee_rebate": number
    }
}