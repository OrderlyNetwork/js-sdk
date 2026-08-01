const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const { triggerPipeline } = require("./triggerPipeline");

describe("trigger pipeline", () => {
  test("validates configuration before making a request", async () => {
    let requestCount = 0;

    await assert.rejects(
      triggerPipeline("1.2.3", {
        env: { CI_COMMIT_BRANCH: "internal/20260801" },
        fetchImpl: async () => {
          requestCount += 1;
        },
      }),
      /TRIGGER_PIPELINE_PROJECT_ID.*TRIGGER_PIPELINE_TOKEN.*GIT_TOKEN/,
    );

    assert.equal(requestCount, 0);
  });

  test("does not log credentials when the downstream branch is missing", async () => {
    const gitToken = "git-secret-token";
    const triggerToken = "trigger-secret-token";
    const logs = [];
    const notifications = [];

    const result = await triggerPipeline("1.2.3", {
      env: createEnvironment(gitToken, triggerToken),
      fetchImpl: async () => ({ ok: false, status: 404 }),
      logger: { log: (...values) => logs.push(values.join(" ")) },
      notify: async (message) => notifications.push(message),
    });

    assert.equal(result, undefined);
    assert.equal(notifications.length, 1);
    assert.doesNotMatch(logs.join("\n"), new RegExp(gitToken));
    assert.doesNotMatch(logs.join("\n"), new RegExp(triggerToken));
  });

  test("passes credentials only in requests and keeps logs secret-free", async () => {
    const gitToken = "git-secret-token";
    const triggerToken = "trigger-secret-token";
    const logs = [];
    const requests = [];

    const result = await triggerPipeline("1.2.3", {
      env: createEnvironment(gitToken, triggerToken),
      fetchImpl: async (url, options) => {
        requests.push({ url, options });
        if (requests.length === 1) {
          return { ok: true, status: 200 };
        }
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: 12345, status: "pending" }),
        };
      },
      logger: { log: (...values) => logs.push(values.join(" ")) },
      notify: async () => {},
    });

    assert.equal(result.id, 12345);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].options.headers["PRIVATE-TOKEN"], gitToken);
    assert.equal(requests[1].options.body.get("token"), triggerToken);
    assert.equal(requests[1].options.body.get("ref"), "release/20260801");
    assert.doesNotMatch(logs.join("\n"), new RegExp(gitToken));
    assert.doesNotMatch(logs.join("\n"), new RegExp(triggerToken));
  });
});

function createEnvironment(gitToken, triggerToken) {
  return {
    CI_COMMIT_BRANCH: "internal/20260801",
    GIT_TOKEN: gitToken,
    TRIGGER_PIPELINE_PROJECT_ID: "123",
    TRIGGER_PIPELINE_TOKEN: triggerToken,
  };
}
