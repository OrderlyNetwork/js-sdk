// beforeEach(() => {
//     // initializeCityDatabase();

//   });
import { CreateAppOptions } from "../services/types";
import NextCreator from "../services/frameworks/next/creator";

test("Next creator", async () => {
  const nextCreator = new NextCreator({
    fullPath: "/Users/leo/orderly/temp/my-orderly-app",
    walletConnector: "blockNative",
    pages: ["trading"],
    brokerId: "orderly",
    brokerName: "Orderly",
  } as CreateAppOptions);

  await nextCreator.createProjectFiles();
});

test("Next creator: create config file", async () => {
  const nextCreator = new NextCreator({
    walletConnector: "custom",
  } as CreateAppOptions);

  await nextCreator.configure();
});
