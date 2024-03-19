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

  //** will be return YYYY-MM-ddThh:mm:ssZ */
  export function formatTime(time?: string): string | undefined {
    if (!time) return undefined;
    const date = new Date(time);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes} UTC`;
    return formattedTime;
  }

  export function formatYMDTime(time?: string): string | undefined {
    if (!time) return undefined;
    const date = new Date(time);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    const formattedTime = `${year}-${month}-${day}`;
    return formattedTime;
  }