const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

/**
 * Send a message to every configured notification provider.
 *
 * Providers without complete configuration are skipped. Configured providers
 * are notified in parallel, and failures are reported after every provider has
 * had a chance to send the message.
 *
 * @param {string} message
 * @param {{ link?: { label: string, url: string } }} [options]
 * @returns {Promise<void>}
 */
async function notify(message, options = {}) {
  const providers = getConfiguredProviders(message, options);

  if (providers.length === 0) {
    console.warn("No notification provider configured");
    return;
  }

  const results = await Promise.allSettled(
    providers.map((provider) => provider.send()),
  );
  const failures = [];
  const failedProviders = [];

  results.forEach((result, index) => {
    const provider = providers[index];

    if (result.status === "fulfilled") {
      console.log(`Notify ${provider.name} success`);
      return;
    }

    const error = normalizeError(result.reason);
    console.error(`Notify ${provider.name} error: ${error.message}`);
    failures.push(new Error(`${provider.name}: ${error.message}`));
    failedProviders.push(provider.name);
  });

  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      `Failed to send notifications: ${failedProviders.join(", ")}`,
    );
  }
}

/**
 * Send a best-effort notification without affecting the caller's result.
 *
 * @param {string} message
 * @param {{ link?: { label: string, url: string } }} [options]
 * @returns {Promise<void>}
 */
async function notifySafely(message, options = {}) {
  try {
    await notify(message, options);
  } catch (error) {
    console.error(
      `Failed to send notification: ${normalizeError(error).message}`,
    );
  }
}

function getConfiguredProviders(message, { link } = {}) {
  const providers = [];
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (
    isProviderEnabled(process.env.ENABLE_TELEGRAM) &&
    telegramToken &&
    telegramChatId
  ) {
    providers.push({
      name: "Telegram",
      send: () => sendTelegram(message, telegramToken, telegramChatId, link),
    });
  }

  if (isProviderEnabled(process.env.ENABLE_SLACK) && slackWebhookUrl) {
    providers.push({
      name: "Slack",
      send: () => sendSlack(message, slackWebhookUrl, link),
    });
  }

  return providers;
}

/**
 * When the enable flag is unset, keep the existing credential-based behavior.
 * When set, only the exact string "true" enables the provider.
 *
 * @param {string | undefined} envValue
 * @returns {boolean}
 */
function isProviderEnabled(envValue) {
  return envValue === undefined || envValue === "true";
}

async function sendTelegram(message, token, chatId, link) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const data = {
    chat_id: chatId,
    text: formatTelegramMessage(message, link),
    parse_mode: "HTML",
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw createRequestError("Telegram", error, [url, token]);
  }

  if (!response.ok) {
    const responseBody = await readResponseBody(response);
    throw new Error(
      formatHttpError("Telegram", response.status, responseBody, [token]),
    );
  }
}

async function sendSlack(message, webhookUrl, link) {
  let response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: formatSlackMessage(message, link) }),
    });
  } catch (error) {
    throw createRequestError("Slack", error, [webhookUrl]);
  }

  if (!response.ok) {
    const responseBody = await readResponseBody(response);
    throw new Error(
      formatHttpError("Slack", response.status, responseBody, [webhookUrl]),
    );
  }
}

function formatTelegramMessage(message, link) {
  const linkLength = link ? Array.from(link.label).length + 1 : 0;
  const truncatedMessage = Array.from(message)
    .slice(0, TELEGRAM_MAX_MESSAGE_LENGTH - linkLength)
    .join("");
  const formattedMessage = `<pre>${escapeHtml(truncatedMessage)}</pre>`;

  if (!link) {
    return formattedMessage;
  }

  return `${formattedMessage}\n<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`;
}

function formatSlackMessage(message, link) {
  const formattedMessage = `\`\`\`\n${escapeSlackMrkdwn(message)}\n\`\`\``;

  if (!link) {
    return formattedMessage;
  }

  return `${formattedMessage}\n<${escapeSlackMrkdwn(link.url)}|${escapeSlackMrkdwn(link.label)}>`;
}

function escapeHtml(message) {
  return message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeSlackMrkdwn(message) {
  return message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function readResponseBody(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function formatHttpError(provider, status, responseBody, secrets) {
  const details = responseBody ? `: ${responseBody}` : "";
  return redactSecrets(
    `${provider} request failed with status ${status}${details}`,
    secrets,
  );
}

function createRequestError(provider, error, secrets) {
  const message = redactSecrets(normalizeError(error).message, secrets);
  return new Error(`${provider} request failed: ${message}`);
}

function redactSecrets(message, secrets) {
  return secrets.reduce(
    (result, secret) =>
      secret ? result.replaceAll(secret, "[REDACTED]") : result,
    message,
  );
}

function normalizeError(error) {
  return error instanceof Error ? error : new Error(String(error));
}

module.exports = {
  notify,
  notifySafely,
};
