import { useConfig } from "nextra-theme-docs";
import { ConnectButton } from "../connectButton";

export const NavBar = () => {
  const config = useConfig();
  console.log(config);

  return (
    <div className="h-[64px] shadow sticky top-0 z-10 bg-white">
      <div className="flex flex-row items-center justify-between h-full container m-auto">
        <img src="/images/orderly.log.png" width={40} />
        <div className="flex gap-3 items-center">
          <ul className="flex gap-3">
            <li>Document</li>
            <li>APIs</li>
          </ul>
          <ConnectButton />
        </div>
      </div>
    </div>
  );
};
