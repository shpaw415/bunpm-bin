import AdmZip from "adm-zip";
import fs from "fs";
import {
  defaultPublish,
  getBinConfig,
  getConfig,
  getPackageJson,
  packageJsonDependencies,
  updateBinConfig,
  updateConfig,
  updatePackageJson,
} from "../files";
import { PackageExists, sendPackage, testApiKey } from "./api";
import { Prompt } from "../bun_module/console";

export const packageFileName = "package.zip";
export const prefix = "@bunpmjs/";

export function zipFiles(compile: Array<string>, required?: Array<string>) {
  const zip = new AdmZip();
  required?.map((f) => {
    if (!fs.existsSync(f))
      throw new Error("file: " + f + ". Required do not exists");
  });
  compile.map((f) => {
    if (!fs.existsSync(f)) return;
    if (fs.lstatSync(f).isFile()) {
      zip.addLocalFile(f);
    } else zip.addLocalFolder(f, f);
  });
  zip.writeZip(packageFileName);
}

export async function Publish() {
  let config = await getConfig();
  let binConfig = await getBinConfig();
  const packageJson = await getPackageJson();
  const form = new FormData();

  if (config.version === packageJson.version) {
    throw new Error(
      "You must update the version of your package in package.json to continue"
    );
  }

  zipFiles([...config.include, ...defaultPublish], ["package.json"]);

  if (!binConfig.api_key) {
    console.log("api_key not set in bunpm.json\n\n");
    const key = await Prompt({
      message: "your api key",
      rule: async (key) => {
        return await testApiKey({
          api_key: key,
        });
      },
      errorMsg: "Your api key is not valid",
    });
    await updateBinConfig({
      api_key: key,
    });
    binConfig = await getBinConfig();
  }

  form.append("package", Bun.file(packageFileName), packageFileName);

  const res = await sendPackage({
    api_key: binConfig.api_key as string,
    formdata: form,
    packageName: packageJson.name,
  });
  fs.rmSync(packageFileName);
  await updateConfig({
    version: packageJson.version,
  });
  if (!res) {
    console.log(
      "\n\nerror while publishing to npm version in package.json do not match in bunpm.json\n\n"
    );
    return false;
  }
  console.log(
    `published to BUnpm - ${packageJson.name}@${packageJson.version}`
  );
}

export async function Install(
  name: string,
  type: "dev" | "peer" | "dep" | keyof packageJsonDependencies
) {
  const res = await PackageExists(
    name.split("@")[name.startsWith("@") ? 1 : 0]
  );
  if (!res.status) return console.log(`the package "${name}" do not exists`);

  const install_process = Bun.spawn({
    cmd: ["bun", "install", `${prefix}${name}`],
    stdout: "inherit",
    stdin: "inherit",
  });
}
export function Remove(name: string) {
  Bun.spawn(["bun", "remove", `${prefix}${name}`], {
    stdout: "inherit",
    stdin: "inherit",
  });
}
