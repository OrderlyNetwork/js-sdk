declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
    debugPrint: (message: any) => void;
  }
}
