// @vitest-environment jsdom
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { act, create } from "react-test-renderer";
import { expect, it } from "vitest";
import { LegacyPredictionRedirect } from "../legacyPredictionRedirect";

it.each(["/en/prediction", "/zh/prediction/BTC%2F5M%25"])(
  "replaces the legacy entry and preserves URL suffixes: %s",
  (path) => {
    let current = "";
    let back: () => void = () => {};
    function Observer() {
      const location = useLocation();
      const navigate = useNavigate();
      current = `${location.pathname}${location.search}${location.hash}`;
      back = () => navigate(-1);
      return null;
    }
    let root: ReturnType<typeof create>;
    act(() => {
      root = create(
        <MemoryRouter
          initialEntries={["/start", `${path}?network=test#orders`]}
        >
          <Observer />
          <Routes>
            <Route
              path="/:lang/prediction/:symbol?"
              element={<LegacyPredictionRedirect />}
            />
            <Route path="*" element={null} />
          </Routes>
        </MemoryRouter>,
      );
    });
    expect(current).toBe(
      `${path.replace("/prediction", "/predict")}?network=test#orders`,
    );
    act(() => back());
    expect(current).toBe("/start");
    act(() => root.unmount());
  },
);
