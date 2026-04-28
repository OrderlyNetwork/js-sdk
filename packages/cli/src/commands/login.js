const crypto = require("crypto");
const { exec } = require("child_process");
const { heading, info, success, warn, error } = require("../shared");
const { saveOAuthToken, isLoggedIn } = require("../internal/auth");
const { startCallbackServer } = require("../internal/login-server");
const {
  CLI_CALLBACK_PORT,
  CLI_LOGIN_TIMEOUT_MS,
  MARKETPLACE_WEB_LOGIN_URL,
} = require("../internal/constants");

function openBrowser(url) {
  const platform = process.platform;
  let command;
  if (platform === "darwin") {
    command = `open "${url}"`;
  } else if (platform === "win32") {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  return new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  command: "login",
  describe: "Login to Orderly Marketplace via GitHub",
  builder: (yargs) => {
    return yargs
      .option("port", {
        alias: "p",
        type: "number",
        describe:
          "number; local callback server port used for the OAuth redirect (must be available). Default is the CLI_CALLBACK_PORT constant",
        default: CLI_CALLBACK_PORT,
      })
      .option("force", {
        alias: "f",
        type: "boolean",
        describe:
          "boolean; if true, force re-login even if you're already logged in",
        default: false,
      })
      .example("orderly login", "Open the browser and complete GitHub OAuth")
      .example(
        "orderly login --force --port 9877",
        "Re-authenticate and use a custom callback port",
      );
  },
  handler: async (argv) => {
    heading("Login to Orderly Marketplace");
    info("This will open your browser to authenticate via GitHub.\n");

    if (isLoggedIn() && !argv.force) {
      warn("You are already logged in.");
      info("Use 'orderly login --force' to re-authenticate.");
      return;
    }

    // Generate CSRF state
    const state = crypto.randomBytes(16).toString("hex");
    const port = argv.port;
    const browserUrl = `${MARKETPLACE_WEB_LOGIN_URL}?port=${port}&state=${state}`;

    // Start local callback server
    const { server, waitForToken } = startCallbackServer({ port, state });

    // Handle server errors (e.g. port in use)
    const serverReady = new Promise((resolve, reject) => {
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          reject(
            new Error(
              `Port ${port} is already in use. Use --port to specify a different port.`,
            ),
          );
        } else {
          reject(err);
        }
      });
      server.on("listening", resolve);
    });

    try {
      server.listen(port);
      await serverReady;
    } catch (err) {
      error(err.message);
      server.close();
      return;
    }

    // Open browser
    info("Opening browser...");
    info(`  ${browserUrl}\n`);
    try {
      await openBrowser(browserUrl);
    } catch (e) {
      info("Could not open browser automatically.");
      info("Please open the URL above in your browser manually.\n");
    }

    info("Waiting for authentication...");

    // Timeout
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      error("Login timed out after 3 minutes.");
    }, CLI_LOGIN_TIMEOUT_MS);

    // Handle Ctrl+C during login
    const onSigInt = () => {
      info("\nLogin cancelled.");
      clearTimeout(timeout);
      server.close();
      process.exit(1);
    };
    process.on("SIGINT", onSigInt);

    try {
      const tokenData = await waitForToken;
      clearTimeout(timeout);
      process.removeListener("SIGINT", onSigInt);

      saveOAuthToken(tokenData);

      success("Login successful!");
      const displayName = tokenData.email || tokenData.username;
      if (displayName) {
        info(`Logged in as: ${displayName}`);
      }
      info("Use 'orderly-devkit whoami' to verify your account.");
    } catch (err) {
      if (!timedOut) {
        error(`Login failed: ${err.message}`);
      }
    } finally {
      server.close();
    }
  },
};
