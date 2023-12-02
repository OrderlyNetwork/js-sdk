import { ConnectButton } from "../connectButton";
import Link from "next/link";
import { NavbarExtra } from "../navbarExtra";
import clsx from "clsx";
import { useRouter } from "next/router";

export const NavBar = () => {
  const router = useRouter();

  const isActive = (path) => {
    return router.pathname.startsWith(path);
  };
  return (
    <div className="h-[65px] sticky top-0 z-50 border-b border-base-400 relative">
      <div className="topnav"></div>
      <div className="flex flex-row items-center justify-between h-full max-w-[90rem] m-auto px-[24px]">
        <Link href="/docs/hooks/overview">
          <img
            src="https://mintlify.s3-us-west-1.amazonaws.com/orderly/logo/dark.png"
            style={{ height: "27px" }}
          />
        </Link>

        <div className="flex gap-3 items-center text-sm text-base-contrast-54">
          <ul className="flex gap-3 space-x-3">
            <li className="">
              <Link href="/docs/hooks/overview">Docs</Link>
            </li>
            <li
              className={clsx(
                isActive("/componet") && "font-bold text-base-contrast"
              )}
            >
              <Link href="/components/introduction">Components</Link>
            </li>
            <li
              className={clsx(
                isActive("/theme") && "font-bold text-base-contrast"
              )}
            >
              <Link href="/theme">Theme</Link>
            </li>
            <li
              className={clsx(
                isActive("/apis/modules/[module]") &&
                  "font-bold text-base-contrast"
              )}
            >
              <Link href="/apis/modules/__orderly_network___hooks">APIs</Link>
            </li>
          </ul>
          {/* <ConnectButton /> */}
          <NavbarExtra />
        </div>
      </div>
    </div>
  );
};
