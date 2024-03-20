import { toast } from "@orderly.network/react";

export function addQueryParam(url: string, paramName: string, paramValue: string): string {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
  
    searchParams.set(paramName, paramValue);
  
    urlObj.search = searchParams.toString();
  
    return urlObj.toString();
  }

  export async function copyText(content: string)  {
    try {
        await navigator.clipboard.writeText(content);
        toast.success("Copy success");
    } catch (error) {
        toast.success("Copy failed");
    }
  }

  function parseTime(time?: number | string): Date | null {
    if (!time) return null;
    const timestamp = typeof time === 'number' ? time : Date.parse(time);
    
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
    
    return null;
  }

  //** will be return YYYY-MM-ddThh:mm:ssZ */
  export function formatTime(time?: number | string): string | undefined {
    const date = parseTime(time);
    if (!date) return undefined;
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes} UTC`;
    return formattedTime;
  }

  //** will return yyyy-MM-dd */
  export function formatYMDTime(time?: number | string): string | undefined {
    const date = parseTime(time);
    if (!date) return undefined;
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    const formattedTime = `${year}-${month}-${day}`;
    return formattedTime;
  }

  //** will return hh:mm */
  export function formatHMTime(time?: number | string): string | undefined {
    const date = parseTime(time);
    if (!date) return undefined;
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime;
  }

  //** compare two date, yyyy-mm-dd */
export function compareDate(d1?: Date, d2?: Date) {
  const isEqual = d1 && d2 &&
      d1.getDay() === d2.getDay()
      && d1.getMonth() === d2.getMonth()
      && d1.getFullYear() === d2.getFullYear();

  
  return isEqual;
}