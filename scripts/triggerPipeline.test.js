const assert = require("node:assert/strict");
const os = require("node:os");
const { describe, test } = require("node:test");

const {
  getPackageVersion,
  getTriggerBranch,
  main,
  triggerPipeline,
} = require("./triggerPipeline");

describe("trigger pipeline", () => {
  test("notifies failures with the CI job URL, not the API request URL", async () => {
    const jobUrl = "https://gitlab.com/group/project/-/jobs/99";
    const notifications = [];

    await assert.rejects(
      main({
        env: {
          ...createEnvironment("git-secret-token", "trigger-secret-token"),
          CI_JOB_URL: jobUrl,
        },
        fetchImpl: async () =>
          createResponse(503, { message: "Service temporarily unavailable" }),
        notify: async (message, options) => {
          notifications.push({ message, options });
        },
      }),
      /Branch lookup failed with status 503/,
    );

    assert.equal(notifications.length, 1);
    assert.deepEqual(notifications[0].options.link, {
      label: "View Job",
      url: jobUrl,
    });
    assert.doesNotMatch(notifications[0].options.link.url, /\/api\/v4\//);
  });

  test("falls back to the CI pipeline URL when CI_JOB_URL is missing", async () => {
    const pipelineUrl = "https://gitlab.com/group/project/-/pipelines/42";
    const notifications = [];

    await assert.rejects(
      main({
        env: {
          ...createEnvironment("git-secret-token", "trigger-secret-token"),
          CI_PIPELINE_URL: pipelineUrl,
        },
        fetchImpl: async () =>
          createResponse(503, { message: "Service temporarily unavailable" }),
        notify: async (message, options) => {
          notifications.push({ message, options });
        },
      }),
      /Branch lookup failed with status 503/,
    );

    assert.equal(notifications.length, 1);
    assert.deepEqual(notifications[0].options.link, {
      label: "View Pipeline",
      url: pipelineUrl,
    });
  });

  test("validates configuration before making a request", async () => {
    let requestCount = 0;

    await assert.rejects(
      triggerPipeline("1.2.3", {
        env: { CI_COMMIT_BRANCH: "internal/20260801" },
        fetchImpl: async () => {
          requestCount += 1;
        },
      }),
      /TRIGGER_PIPELINE_PROJECT_ID.*TRIGGER_PIPELINE_TOKEN.*GIT_TOKEN.*RELEASE_TAG_ENV.*APP_TARGET/,
    );

    assert.equal(requestCount, 0);
  });

  test("maps only an internal branch prefix to release for non-prod", () => {
    assert.equal(
      getTriggerBranch({
        ciBranch: "internal/20260801",
        releaseTagEnv: "dev",
      }),
      "release/20260801",
    );
    assert.equal(
      getTriggerBranch({
        ciBranch: "feature/internal/20260801",
        releaseTagEnv: "qa",
      }),
      "feature/internal/20260801",
    );
  });

  test("forces main when releasing to prod", () => {
    assert.equal(
      getTriggerBranch({
        ciBranch: "internal/20260801",
        releaseTagEnv: "prod",
      }),
      "main",
    );
  });

  test("reads the package version independently of the working directory", () => {
    const originalDirectory = process.cwd();

    try {
      process.chdir(os.tmpdir());
      assert.match(getPackageVersion(), /^\d+\.\d+\.\d+/);
    } finally {
      process.chdir(originalDirectory);
    }
  });

  test("does not log credentials when the downstream branch is missing", async () => {
    const gitToken = "git-secret-token";
    const triggerToken = "trigger-secret-token";
    const logs = [];
    const notifications = [];

    const result = await triggerPipeline("1.2.3", {
      env: createEnvironment(gitToken, triggerToken),
      fetchImpl: async () =>
        createResponse(404, { message: "404 Branch Not Found" }),
      logger: { log: (...values) => logs.push(values.join(" ")) },
      notify: async (message) => notifications.push(message),
    });

    assert.equal(result, undefined);
    assert.equal(notifications.length, 1);
    assert.doesNotMatch(logs.join("\n"), new RegExp(gitToken));
    assert.doesNotMatch(logs.join("\n"), new RegExp(triggerToken));
  });

  test("treats a project lookup 404 as an error", async () => {
    let notificationCount = 0;

    await assert.rejects(
      triggerPipeline("1.2.3", {
        env: createEnvironment("git-secret-token", "trigger-secret-token"),
        fetchImpl: async () =>
          createResponse(404, { message: "404 Project Not Found" }),
        notify: async () => {
          notificationCount += 1;
        },
      }),
      /Branch lookup failed with status 404.*Project Not Found/,
    );

    assert.equal(notificationCount, 0);
  });

  test("reports non-404 branch lookup errors with response details", async () => {
    await assert.rejects(
      triggerPipeline("1.2.3", {
        env: createEnvironment("git-secret-token", "trigger-secret-token"),
        fetchImpl: async () =>
          createResponse(503, { message: "Service temporarily unavailable" }),
        notify: async () => {},
      }),
      /Branch lookup failed with status 503.*Service temporarily unavailable/,
    );
  });

  test("passes credentials only in requests and keeps logs secret-free", async () => {
    const gitToken = "git-secret-token";
    const triggerToken = "trigger-secret-token";
    const logs = [];
    const requests = [];

    const result = await triggerPipeline("1.2.3", {
      env: createEnvironment(
        gitToken,
        triggerToken,
        "orderlynetwork/downstream",
      ),
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
    assert.match(
      requests[0].url,
      /projects\/orderlynetwork%2Fdownstream\/repository\/branches\/release%2F20260801$/,
    );
    assert.match(
      requests[1].url,
      /projects\/orderlynetwork%2Fdownstream\/trigger\/pipeline$/,
    );
    assert.equal(requests[0].options.headers["PRIVATE-TOKEN"], gitToken);
    assert.equal(requests[1].options.body.get("token"), triggerToken);
    assert.equal(requests[1].options.body.get("ref"), "release/20260801");
    assert.equal(
      requests[1].options.body.get("variables[PACKAGE_VERSION]"),
      "1.2.3",
    );
    assert.equal(
      requests[1].options.body.get("variables[TRIGGER_BRANCH]"),
      "release/20260801",
    );
    assert.equal(
      requests[1].options.body.get("variables[RELEASE_TAG_ENV]"),
      "dev",
    );
    assert.equal(requests[1].options.body.get("variables[APP_TARGET]"), "demo");
    assert.doesNotMatch(logs.join("\n"), new RegExp(gitToken));
    assert.doesNotMatch(logs.join("\n"), new RegExp(triggerToken));
  });

  test("redacts and truncates pipeline error response details", async () => {
    const gitToken = "git-secret-token";
    const triggerToken = "trigger-secret-token";
    let requestCount = 0;

    await assert.rejects(
      triggerPipeline("1.2.3", {
        env: createEnvironment(gitToken, triggerToken),
        fetchImpl: async () => {
          requestCount += 1;
          if (requestCount === 1) {
            return createResponse(200);
          }
          return createResponse(
            400,
            `${gitToken} ${triggerToken} ${"x".repeat(3_000)}`,
          );
        },
        notify: async () => {},
      }),
      (error) => {
        assert.match(error.message, /Pipeline trigger failed with status 400/);
        assert.equal(
          error.requestUrl,
          "https://gitlab.com/api/v4/projects/123/trigger/pipeline",
        );
        assert.doesNotMatch(error.message, /gitlab\.com/);
        assert.match(error.message, /\[REDACTED\]/);
        assert.doesNotMatch(error.message, new RegExp(gitToken));
        assert.doesNotMatch(error.message, new RegExp(triggerToken));
        assert.ok(error.message.length < 2_200);
        return true;
      },
    );
  });

  test("wraps branch lookup network errors", async () => {
    await assert.rejects(
      triggerPipeline("1.2.3", {
        env: createEnvironment("git-secret-token", "trigger-secret-token"),
        fetchImpl: async () => {
          throw new Error("socket closed");
        },
        notify: async () => {},
      }),
      (error) => {
        assert.match(
          error.message,
          /Branch lookup request failed: socket closed/,
        );
        assert.equal(
          error.requestUrl,
          "https://gitlab.com/api/v4/projects/123/repository/branches/release%2F20260801",
        );
        return true;
      },
    );
  });

  test("times out a branch lookup without retrying it", async () => {
    let requestCount = 0;

    await assert.rejects(
      triggerPipeline("1.2.3", {
        env: createEnvironment("git-secret-token", "trigger-secret-token"),
        fetchImpl: async (_url, options) => {
          requestCount += 1;
          return new Promise((resolve, reject) => {
            const keepAliveTimer = setTimeout(resolve, 1_000);
            options.signal.addEventListener(
              "abort",
              () => {
                clearTimeout(keepAliveTimer);
                reject(options.signal.reason);
              },
              { once: true },
            );
          });
        },
        notify: async () => {},
        timeoutMs: 5,
      }),
      /Branch lookup timed out after 5ms/,
    );

    assert.equal(requestCount, 1);
  });

  test("times out a pipeline trigger without retrying it", async () => {
    let requestCount = 0;

    await assert.rejects(
      triggerPipeline("1.2.3", {
        env: createEnvironment("git-secret-token", "trigger-secret-token"),
        fetchImpl: async (_url, options) => {
          requestCount += 1;
          if (requestCount === 1) {
            return createResponse(200);
          }

          return new Promise((resolve, reject) => {
            const keepAliveTimer = setTimeout(resolve, 1_000);
            options.signal.addEventListener(
              "abort",
              () => {
                clearTimeout(keepAliveTimer);
                reject(options.signal.reason);
              },
              { once: true },
            );
          });
        },
        notify: async () => {},
        timeoutMs: 5,
      }),
      (error) => {
        assert.match(error.message, /Pipeline trigger timed out after 5ms/);
        assert.equal(
          error.requestUrl,
          "https://gitlab.com/api/v4/projects/123/trigger/pipeline",
        );
        return true;
      },
    );

    assert.equal(requestCount, 2);
  });
});

function createEnvironment(gitToken, triggerToken, projectId = "123") {
  return {
    APP_TARGET: "demo",
    CI_COMMIT_BRANCH: "internal/20260801",
    GIT_TOKEN: gitToken,
    RELEASE_TAG_ENV: "dev",
    TRIGGER_PIPELINE_PROJECT_ID: projectId,
    TRIGGER_PIPELINE_TOKEN: triggerToken,
  };
}

function createResponse(status, body = "") {
  const responseBody = typeof body === "string" ? body : JSON.stringify(body);

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    text: async () => responseBody,
  };
}
