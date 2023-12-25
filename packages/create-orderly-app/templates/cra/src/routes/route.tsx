import { createBrowserRouter } from "react-router-dom";
import Trading from "./perp/tradingPage";
import { Home } from "./home";

export const route = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/perp/:symbol",
    element: <Trading />,
  },
]);
