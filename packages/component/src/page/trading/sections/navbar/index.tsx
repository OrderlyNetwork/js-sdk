import { Logo } from "@/logo";

export const NavBar = () => {
  return (
    <div className="flex flex-row items-center">
      <div className="grow flex flex-row items-center gap-4">
        <div>BTC-PERP</div>
        <div className="flex flex-col">
          <div>31,205.80</div>
          <div>0.00%</div>
        </div>
        <div className="flex flex-col">
          <div>Pred.Funding Rate</div>
          <div className="flex flex-row">
            <span>-0.0011%</span>
            <span>in 12:34:56</span>
          </div>
        </div>
      </div>
      <Logo link={""} image={""} />
    </div>
  );
};
