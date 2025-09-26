// Telegram bot token and chat ID for sending notifications
const telegram = {
  /** Telegram bot token */
  token: process.env.TELEGRAM_TOKEN,
  /** Chat ID to send messages to (get it via https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates) */
  chatId: process.env.TELEGRAM_CHAT_ID,
};

/**
 * Send a formatted message to a Telegram chat using bot API.
 * Throws error if notification fails and success flag is false.
 */
async function notifyTelegram(message) {
  if (!telegram.chatId || !telegram.token) {
    console.error("Not provider telegram chat id and token");
    return;
  }
  // Telegram message max length limit
  const maxLength = 4096;

  let sendMessage = message.substring(0, maxLength);

  if (message.length > maxLength) {
    // Truncate message to max length
    sendMessage = message.substring(0, maxLength);
  }

  const url = `https://api.telegram.org/bot${telegram.token}/sendMessage`;
  const data = {
    chat_id: telegram.chatId,
    text: formatCodeMessage(sendMessage),
    parse_mode: "HTML",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log("notify telegram success:", responseData);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("notify telegram error:", error);
    throw error;
  }
}

/**
 * Format a message string as preformatted HTML for Telegram.
 */
function formatCodeMessage(message) {
  return `<pre>${message}</pre>`;
}

module.exports = {
  notifyTelegram,
};
