const { heading, info, success, warn } = require("../shared");
const { isLoggedIn, logout } = require("../internal/auth");

module.exports = {
  command: "logout",
  describe: "Logout from Orderly Marketplace",
  handler: async () => {
    heading("Logout from Orderly Marketplace");

    if (!isLoggedIn()) {
      warn("You are not logged in.");
      return;
    }

    info("This command will clear your stored authentication.\n");

    logout();

    success("Logout successful!");
    console.log("Your session has been cleared.");
  },
};
