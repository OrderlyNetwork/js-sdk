const { heading, info, success, warn } = require("../shared");
const { getEmail, isLoggedIn } = require("../internal/auth");

module.exports = {
  command: "whoami",
  describe: "Display current logged in user",
  handler: async () => {
    heading("Current User");

    if (!isLoggedIn()) {
      warn("You are not logged in.");
      info("Run 'orderly login' to authenticate.");
      return;
    }

    const email = getEmail();
    success(`Logged in as: ${email}`);
  },
};
