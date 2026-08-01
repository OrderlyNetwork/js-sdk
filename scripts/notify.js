const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

/**
 * Send a message to every configured notification provider.
 *
 * Providers without complete configuration are skipped. Configured providers
 * are notified in parallel, and failures are reported after every provider has
 * had a chance to send the message.
 *
 * @param {string} message
 * @returns {Promise<void>}
 */
async function notify(message) {
  const providers = getConfiguredProviders(message);

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
 * Send a best-effort notification without replacing an existing error.
 *
 * @param {string} message
 * @returns {Promise<void>}
 */
async function notifySafely(message) {
  try {
    await notify(message);
  } catch (error) {
    console.error(
      `Failed to send failure notification: ${normalizeError(error).message}`,
    );
  }
}

function getConfiguredProviders(message) {
  const providers = [];
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (telegramToken && telegramChatId) {
    providers.push({
      name: "Telegram",
      send: () => sendTelegram(message, telegramToken, telegramChatId),
    });
  }

  if (slackWebhookUrl) {
    providers.push({
      name: "Slack",
      send: () => sendSlack(message, slackWebhookUrl),
    });
  }

  return providers;
}

async function sendTelegram(message, token, chatId) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const data = {
    chat_id: chatId,
    text: formatTelegramMessage(message),
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

async function sendSlack(message, webhookUrl) {
  let response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message }),
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

function formatTelegramMessage(message) {
  const truncatedMessage = Array.from(message)
    .slice(0, TELEGRAM_MAX_MESSAGE_LENGTH)
    .join("");
  return `<pre>${escapeHtml(truncatedMessage)}</pre>`;
}

function escapeHtml(message) {
  return message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
