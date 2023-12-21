import AdmZip from "adm-zip";
import fs from "fs";
import {
  defaultPublish,
  getConfig,
  getPackageJson,
  packageJsonDependencies,
  updateConfig,
  updatePackageJson,
} from "../files";
import { PackageExists, sendPackage, testApiKey } from "./api";
import { Prompt } from "../bun_module/console";

export const packageFileName = "package.zip";

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
  const packageJson = await getPackageJson();
  const form = new FormData();

  if (config.version === packageJson.version) {
    throw new Error(
      "You must update the version of your package in package.json to continue"
    );
  }

  zipFiles([...config.include, ...defaultPublish], ["package.json"]);

  if (!config.api_key) {
    console.log("api_key not set in bunpm.json\n\n");
    const key = await Prompt({
      message: "your api key",
      rule: async (key) => {
        return await testApiKey({
          api_key: key,
        });
      },
    });
    await updateConfig({
      api_key: key,
    });
    config = await getConfig();
  }

  form.append("package", Bun.file(packageFileName), packageFileName);

  const res = await sendPackage({
    api_key: config.api_key as string,
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
  const res = await PackageExists(name.split("@")[0]);
  if (!res.status) return console.log(`the package "${name}" do not exists`);
  console.log(res);

  const version = name.split("@")[1] || undefined;
  if (version && version != "latest" && !res.version.includes(version)) {
    return console.log(
      `version: "${version}" do not exists on the package: "${
        res.name.split("/")[1]
      }"`
    );
  }

  const packageJson = await getPackageJson();

  switch (type) {
    case "dep":
      type = "dependencies";
      break;
    case "peer":
      type = "peerDependencies";
      break;
    case "dev":
      type = "devDependencies";
      break;
  }

  await updatePackageJson({
    [type]: {
      ...(await getPackageJson())[type],
      [res.name]: version ? version : res.version.at(-1),
    },
  });
  const install_process = Bun.spawn({
    cmd: ["bun", "install"],
    stdout: "inherit",
    stdin: "inherit",
  });
}
