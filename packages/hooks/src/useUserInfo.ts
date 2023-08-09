import { useState } from "react";

export const useUserInfo = (): { data: any; connected: boolean } => {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  return { data, connected };
};
