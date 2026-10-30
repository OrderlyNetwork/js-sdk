import { get } from "./index";

afterEach(() => jest.restoreAllMocks());
describe("public API errors", () => {
  it("retains the status when a gateway returns a JSON null error", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("null", {
        status: 503,
        statusText: "Service Unavailable",
      }),
    );
    await expect(get("https://api.example")).rejects.toMatchObject({
      status: 503,
      message: "Service Unavailable",
    });
  });
  it.each([400, 404, 429, 503])(
    "retains HTTP %s and the backend business code",
    async (status) => {
      jest.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ message: "Failure", code: -1005 }), {
          status,
        }),
      );
      await expect(
        get("https://api.example/v2/public/announcement/detail"),
      ).rejects.toMatchObject({ message: "Failure", code: -1005, status });
    },
  );
  it("retains the status for a non-JSON gateway error", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response("Bad Gateway", { status: 502, statusText: "Bad Gateway" }),
      );
    await expect(get("https://api.example")).rejects.toMatchObject({
      message: "Bad Gateway",
      status: 502,
    });
  });
  it("keeps the complete list envelope when a formatter is provided", async () => {
    const data = { rows: [], last_updated_time: 10 };
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ success: true, data })));
    await expect(
      get("https://api.example", {}, (value) => value),
    ).resolves.toEqual(data);
  });
});
