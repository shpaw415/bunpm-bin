import { format } from "prettier-package-json";
import { getPackageJson } from "../files";
import { colorConsoleText } from "../bun_module/console";

export async function Create() {
  Bun.spawnSync({
    cmd: ["bun", "init"],
    stdin: "inherit",
    stdout: "inherit",
  });
  if (!(await Bun.file("package.json").exists())) return;
  const configFile = Bun.file("bunpm.json");
  if (await configFile.exists()) return;
  const packageJson = await getPackageJson();
  Bun.write(
    "bunpm.json",
    format({
      include: [packageJson.module],
    })
  );
  console.log(
    colorConsoleText(
      `add file or directory to include 
    for adding it to the package in bunpm.json`,
      "cyan"
    )
  );
}
