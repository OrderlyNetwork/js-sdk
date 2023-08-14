export const timeConvertString = (time: number): number[] => {
    time /= 1000;
    const h = Math.floor(time / 3600);
    const m = Math.floor((time / 60) % 60);
    const s = Math.floor(time % 60);
    // return result = h + "小时" + m + "分钟" + s + "秒";
    return [h, m, s];
};
