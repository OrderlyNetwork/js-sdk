import { RouterProvider } from "react-router-dom";
import { route } from "./routes/route";
import "@orderly.network/react/dist/styles.css";

function App() {
  return <RouterProvider router={route} />;
}

export default App;
