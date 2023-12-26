const metaMaks = require("@metamask/sdk");

const qrcode = require("qrcode-terminal");



function handler(argv) {
  const options = {
    shouldShimWeb3: false,
    dappMetadata: {
      name: "NodeJS example",
    },
    logging: {
      sdk: false,
    },
    checkInstallationImmediately: false,
    // Optional: customize modal text
    modals: {
      install: ({ link }) => {
        qrcode.generate(link, { small: true }, (qr) => console.log(qr));
        return {};
      },
      otp: () => {
        return {
          mount() {},
          updateOTPValue: (otpValue) => {
            if (otpValue !== "") {
              console.debug(
                `[CUSTOMIZE TEXT] Choose the following value on your metamask mobile wallet: ${otpValue}`
              );
            }
          },
        };
      },
    },
  };
  const MMSDK = new metaMaks.MetaMaskSDK(options);
  console.log("create:::::", argv);



//   MMSDK.init();

//   const ethereum = MMSDK.getProvider();

//   ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
//     console.log(accounts);
//   });

  // MMSDK.connect().then((res) => {
  //     console.log(res)
  // })
}

module.exports = {
  command: "login",
  describe: "Connect to your Orderly account",
  builder: (yargs) => {
    //   yargs.option("name", {
    //     alias: "n",
    //     describe: "project name",
    //     type: "string",
    //     demandOption: true,
    //   });
    //   yargs.option("template", {
    //     alias: "t",
    //     describe: "project template",
    //     type: "string",
    //     demandOption: true,
    //   });
  },
  handler,
};
