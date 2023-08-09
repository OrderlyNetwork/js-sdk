import { MarketOverview } from "@/block/marketOverview";
import { Logo } from "@/logo";

export const NavBar = () => {
  return (
    <div className="flex flex-row items-center">
      <div className="grow flex flex-row items-center gap-4">
        <div>BTC-PERP</div>
        <MarketOverview
          items={{
            price: {
              lastPrice: "123456",
              percentChange: "12.34%",
            },
            fundingRate: {
              fundingRate: "",
              timout: 123,
            },
          }}
        />
      </div>
      <Logo link={""} image={""} />
    </div>
  );
};
