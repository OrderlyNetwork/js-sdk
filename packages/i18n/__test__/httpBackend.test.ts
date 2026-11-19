import i18n from "../src/i18n";
import { Backend } from "../src/resourceBundles/httpBackend";

type MockResponse = { ok: boolean; status: number; json: () => Promise<any> };

const respond = (data: any, delay: number, ok = true) =>
  new Promise<MockResponse>((resolve) =>
    setTimeout(
      () => resolve({ ok, status: ok ? 200 : 404, json: async () => data }),
      delay,
    ),
  );

describe("http backend", () => {
  const ns = "translation";
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    (globalThis as any).fetch = fetchMock;
  });

  afterEach(() => {
    i18n.removeResourceBundle("ja", ns);
    i18n.removeResourceBundle("ko", ns);
    jest.restoreAllMocks();
  });

  it("applies paths in declared order regardless of response order", async () => {
    // the base file responds after the extend file
    fetchMock.mockImplementation((url: string) =>
      url === "/locales/ja.json"
        ? respond({ "common.ok": "base" }, 20)
        : respond({ "common.ok": "extend" }, 0),
    );

    const backend = new Backend({
      loadPath: (lang) => [
        `/locales/${lang}.json`,
        `/locales/extend/${lang}.json`,
      ],
    });

    await backend.loadLanguage("ja", ns);

    expect(i18n.getResource("ja", ns, "common.ok")).toBe("extend");
  });

  it("does not cache failed requests", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    fetchMock
      .mockImplementationOnce(() => respond({}, 0, false))
      .mockImplementationOnce(() => respond({ "common.ok": "ok" }, 0));

    const backend = new Backend({ loadPath: () => "/locales/ko.json" });

    await backend.loadLanguage("ko", ns);
    expect(i18n.getResource("ko", ns, "common.ok")).toBeUndefined();

    await backend.loadLanguage("ko", ns);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(i18n.getResource("ko", ns, "common.ok")).toBe("ok");
  });
});
