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