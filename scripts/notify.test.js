const assert = require("node:assert/strict");
const { afterEach, beforeEach, describe, test } = require("node:test");

const { notify, notifySafely } = require("./notify");

const notificationEnvironmentVariables = [
  "TELEGRAM_TOKEN",
  "TELEGRAM_CHAT_ID",
  "SLACK_WEBHOOK_URL",
  "ENABLE_TELEGRAM",
  "ENABLE_SLACK",
];
const originalEnvironment = Object.fromEntries(
  notificationEnvironmentVariables.map((name) => [name, process.env[name]]),
);
const originalFetch = global.fetch;
const originalConsole = {
  error: console.error,
  log: console.log,
  warn: console.warn,
};

describe("notify", () => {
  beforeEach(() => {
    notificationEnvironmentVariables.forEach((name) => {
      delete process.env[name];
    });
    console.error = () => {};
    console.log = () => {};
    console.warn = () => {};
  });

  afterEach(() => {
    global.fetch = originalFetch;
    console.error = originalConsole.error;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;

    notificationEnvironmentVariables.forEach((name) => {
      const value = originalEnvironment[name];
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    });
  });

  test("sends the message to Telegram and Slack", async () => {
    configureTelegram();
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    const requests = [];
    global.fetch = async (url, options) => {
      requests.push({ url, options });
      return response();
    };

    await notify("release completed");

    assert.equal(requests.length, 2);
    assert.deepEqual(requests[0], {
      url: "https://api.telegram.org/bottelegram-token/sendMessage",
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "telegram-chat-id",
          text: "<pre>release completed</pre>",
          parse_mode: "HTML",
        }),
      },
    });
    assert.deepEqual(requests[1], {
      url: "https://hooks.slack.test/services/example",
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "```\nrelease completed\n```" }),
      },
    });
  });

  test("sends only to Telegram when Slack is not configured", async () => {
    configureTelegram();
    const requests = [];
    global.fetch = async (url) => {
      requests.push(url);
      return response();
    };

    await notify("message");

    assert.deepEqual(requests, [
      "https://api.telegram.org/bottelegram-token/sendMessage",
    ]);
  });

  test("sends only to Slack when Telegram is not configured", async () => {
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    const requests = [];
    global.fetch = async (url) => {
      requests.push(url);
      return response();
    };

    await notify("message");

    assert.deepEqual(requests, ["https://hooks.slack.test/services/example"]);
  });

  test("formats notification links for Telegram and Slack", async () => {
    configureTelegram();
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    const requests = [];
    global.fetch = async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) });
      return response();
    };
    const link = {
      label: "View Job",
      url: "https://gitlab.com/group/project/-/jobs/123?a=1&b=2",
    };

    await notify("pipeline failed", { link });

    assert.equal(
      requests[0].body.text,
      '<pre>pipeline failed</pre>\n<a href="https://gitlab.com/group/project/-/jobs/123?a=1&amp;b=2">View Job</a>',
    );
    assert.equal(
      requests[1].body.text,
      "```\npipeline failed\n```\n<https://gitlab.com/group/project/-/jobs/123?a=1&amp;b=2|View Job>",
    );
  });

  test("does not send or throw when no provider is configured", async () => {
    let requestCount = 0;
    let warning;
    global.fetch = async () => {
      requestCount += 1;
      return response();
    };
    console.warn = (message) => {
      warning = message;
    };

    await notify("message");

    assert.equal(requestCount, 0);
    assert.equal(warning, "No notification provider configured");
  });

  test("skips Telegram when ENABLE_TELEGRAM is not true", async () => {
    configureTelegram();
    process.env.ENABLE_TELEGRAM = "false";
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    const requests = [];
    global.fetch = async (url) => {
      requests.push(url);
      return response();
    };

    await notify("message");

    assert.deepEqual(requests, ["https://hooks.slack.test/services/example"]);
  });

  test("skips Slack when ENABLE_SLACK is not true", async () => {
    configureTelegram();
    process.env.ENABLE_SLACK = "false";
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    const requests = [];
    global.fetch = async (url) => {
      requests.push(url);
      return response();
    };

    await notify("message");

    assert.deepEqual(requests, [
      "https://api.telegram.org/bottelegram-token/sendMessage",
    ]);
  });

  test("sends to both providers when ENABLE flags are true", async () => {
    configureTelegram();
    process.env.ENABLE_TELEGRAM = "true";
    process.env.ENABLE_SLACK = "true";
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    const requests = [];
    global.fetch = async (url) => {
      requests.push(url);
      return response();
    };

    await notify("message");

    assert.deepEqual(requests, [
      "https://api.telegram.org/bottelegram-token/sendMessage",
      "https://hooks.slack.test/services/example",
    ]);
  });

  test("does not send when both ENABLE flags disable providers", async () => {
    configureTelegram();
    process.env.ENABLE_TELEGRAM = "false";
    process.env.ENABLE_SLACK = "false";
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    let requestCount = 0;
    let warning;
    global.fetch = async () => {
      requestCount += 1;
      return response();
    };
    console.warn = (message) => {
      warning = message;
    };

    await notify("message");

    assert.equal(requestCount, 0);
    assert.equal(warning, "No notification provider configured");
  });

  test("attempts Slack and reports an aggregate error when Telegram fails", async () => {
    configureTelegram();
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    const requests = [];
    global.fetch = async (url) => {
      requests.push(url);
      return url.includes("telegram")
        ? response({ ok: false, status: 400, body: "bad request" })
        : response();
    };

    await assert.rejects(notify("message"), (error) => {
      assert(error instanceof AggregateError);
      assert.equal(error.message, "Failed to send notifications: Telegram");
      assert.equal(error.errors.length, 1);
      assert.match(error.errors[0].message, /Telegram/);
      return true;
    });
    assert.equal(requests.length, 2);
  });

  test("aggregates failures from both providers", async () => {
    configureTelegram();
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    global.fetch = async (url) =>
      url.includes("telegram")
        ? response({ ok: false, status: 400, body: "telegram rejected" })
        : response({ ok: false, status: 500, body: "slack rejected" });

    await assert.rejects(notify("message"), (error) => {
      assert(error instanceof AggregateError);
      assert.equal(
        error.message,
        "Failed to send notifications: Telegram, Slack",
      );
      assert.equal(error.errors.length, 2);
      assert.match(error.errors[0].message, /Telegram/);
      assert.match(error.errors[1].message, /Slack/);
      return true;
    });
  });

  test("does not throw when a best-effort notification cannot be sent", async () => {
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/example";
    const errors = [];
    console.error = (...args) => errors.push(args.join(" "));
    global.fetch = async () =>
      response({ ok: false, status: 500, body: "slack rejected" });

    await assert.doesNotReject(notifySafely("release failed"));

    assert.match(
      errors.join("\n"),
      /Failed to send notification: Failed to send notifications: Slack/,
    );
  });

  test("escapes and truncates Telegram messages", async () => {
    configureTelegram();
    let telegramBody;
    global.fetch = async (_url, options) => {
      telegramBody = JSON.parse(options.body);
      return response();
    };
    const message = `<tag attr="value">Tom & Jerry's</tag>${"a".repeat(4096)}`;

    await notify(message);

    assert.match(
      telegramBody.text,
      /^<pre>&lt;tag attr=&quot;value&quot;&gt;Tom &amp; Jerry&#39;s&lt;\/tag&gt;/,
    );
    assert.equal(decodeTelegramMessage(telegramBody.text).length, 4096);
  });

  test("includes the Slack response without logging its webhook URL", async () => {
    const webhookUrl = "https://hooks.slack.test/services/secret";
    process.env.SLACK_WEBHOOK_URL = webhookUrl;
    const errors = [];
    console.error = (...args) => errors.push(args.join(" "));
    global.fetch = async () =>
      response({
        ok: false,
        status: 403,
        body: `invalid webhook ${webhookUrl}`,
      });

    await assert.rejects(notify("message"), (error) => {
      assert.match(error.errors[0].message, /invalid webhook/);
      assert.doesNotMatch(error.errors[0].message, /hooks\.slack\.test/);
      return true;
    });
    assert.match(errors.join("\n"), /invalid webhook/);
    assert.doesNotMatch(errors.join("\n"), /hooks\.slack\.test/);
  });
});

function configureTelegram() {
  process.env.TELEGRAM_TOKEN = "telegram-token";
  process.env.TELEGRAM_CHAT_ID = "telegram-chat-id";
}

function response({ ok = true, status = 200, body = "ok" } = {}) {
  return {
    ok,
    status,
    text: async () => body,
  };
}

function decodeTelegramMessage(message) {
  return message
    .replace(/^<pre>|<\/pre>$/g, "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}
