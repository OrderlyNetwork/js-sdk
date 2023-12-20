import { Link, createBrowserRouter } from "react-router-dom";
import Trading from "./perp/tradingPage";

export const route = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <h1>Trading</h1>
        <Link to="/perp/PERP_ETH_USDC">PERP_ETH_USDC</Link>
      </div>
    ),
  },
  {
    path: "/perp/:symbol",
    element: <Trading />,
  },
]);
