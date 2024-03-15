export function addQueryParam(url: string, paramName: string, paramValue: string): string {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
  
    searchParams.set(paramName, paramValue);
  
    urlObj.search = searchParams.toString();
  
    return urlObj.toString();
  }