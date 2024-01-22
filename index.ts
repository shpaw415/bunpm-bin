import { argParser } from "./bun_module/argv-parser";
import { colorConsoleText } from "./bun_module/console";
import { updateBinConfig } from "./files";
import { testApiKey } from "./src/api";
import { Upgrade } from "./src/bunpm";
import { Create } from "./src/init";
import { Install, Publish, Remove } from "./src/packages";

const currentVersion = "0.1.0";

const arg = new argParser();

arg
  .create([
    {
      mainArg: "create",
      description: "initialize a module ready to publish to bunpm",
    },
    {
      mainArg: "set",
      description: "set settings for bunpm",
      options: [
        { argName: "apikey", description: "the api key to connect to bunpm" },
      ],
    },
    {
      mainArg: "publish",
      description: "publish a package to BUnpm",
    },
    {
      mainArg: "install",
      description: "[Name of the package] install a package from bunpm",
      options: [
        {
          argName: "save",
          description: "dev - dep - peer",
        },
      ],
    },
    {
      mainArg: "remove",
      description: "[name of the package] remove a bunpm package",
    },
    {
      mainArg: "upgrade",
      description: "upgrade bunpm version",
    },
  ])
  .setParams({
    version: currentVersion,
    name: "BUnpm",
  })
  .parse();

type mainArgs =
  | "set"
  | "publish"
  | "test"
  | "install"
  | "remove"
  | "create"
  | "upgrade";

switch (arg.getMainArg() as mainArgs) {
  case "set":
    if (arg.get("apikey")) {
      const res = await testApiKey({
        api_key: arg.get("apikey") as string,
      });
      res ? updateBinConfig({ api_key: arg.get("apikey") }) : null;
    }
    break;
  case "publish":
    await Publish();
    break;
  case "install":
    if (!arg.get("install")) {
      console.log("you must provide a package name");
      break;
    }
    await Install(
      arg.get("install") as string,
      (arg.get("save") as any) || "dep"
    );
    break;
  case "remove":
    const removeName = arg.get("remove");
    if (!removeName) {
      console.log("Please provide a package name to remove");
      break;
    } else Remove(removeName);
    break;
  case "test":
    await testApiKey({ api_key: arg.get("key") || "" });
    break;
  case "create":
    await Create();
    break;
  case "upgrade":
    const newVersion = await Upgrade({ version: currentVersion });
    if (!newVersion) break;
    console.log(
      `new Version: ${colorConsoleText(newVersion, "cyan")} now installed`
    );
    break;
  default:
    arg.throwHelp();
    break;
}
