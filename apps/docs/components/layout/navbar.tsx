import { ConnectButton } from "../connectButton";
import Link from "next/link";

export const NavBar = () => {
  return (
    <div className="h-[65px] border-b-[1px] border-[rgb(229, 231, 235)] border-solid	 sticky top-0 z-10 bg-white">
      <div className="flex flex-row items-center justify-between h-full max-w-[90rem] m-auto px-[24px]">
        <img src="/images/orderly.log.png" width={40} />
        <div className="flex gap-3 items-center">
          <ul className="flex gap-3 text-[#4b5563]">
            <li className="mr-[5px]"><Link  href="/docs/hooks/overview">Docs
            </Link></li>            
            <li className="font-medium">API</li>
          </ul>
          {/* <ConnectButton /> */}
        </div>
      </div>
    </div>
  );
};
