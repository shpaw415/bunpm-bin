import { argParser } from "./bun_module/argv-parser";
import { defaultPublish, getConfig, updateConfig } from "./files";
import { PackageExists, testApiKey } from "./src/api";
import { Install, Publish, zipFiles } from "./src/packages";

const arg = new argParser();

arg
  .create([
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
      mainArg: "test",
      description: "dev test",
    },
    {
      mainArg: "install",
      description: "install a package from bunpm",
      options: [
        {
          argName: "save",
          description: "dev - dep - peer",
        },
      ],
    },
  ])
  .parse();

type mainArgs = "set" | "publish" | "test" | "install";

switch (arg.getMainArg() as mainArgs) {
  case "set":
    if (arg.get("apikey")) updateConfig({ api_key: arg.get("apikey") });
    break;
  case "publish":
    await Publish();
    break;
  case "install":
    await Install(
      arg.get("install") as string,
      (arg.get("save") as any) || "dep"
    );
    break;
  case "test":
    break;
  default:
    arg.throwHelp();
    break;
}
