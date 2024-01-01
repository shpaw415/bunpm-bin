import { format } from "prettier-package-json";
import { homedir } from "os";
export const defaultPublish = ["package.json"];
const bunConfigFileName = "bunpm.json";
const bunpmBinConfigFileName = "bunpm.bin.json";
const bunpmBinPath = homedir() + "/.bunpm/bin";
export interface bunpmConfig {
  include: string[];
  version?: string;
}

export interface bunpmBinConfig {
  api_key?: string;
}

export async function getConfig() {
  return (await Bun.file(bunConfigFileName).json()) as bunpmConfig;
}
export async function getBinConfig() {
  return (await Bun.file(
    `${bunpmBinPath}/${bunpmBinConfigFileName}`
  ).json()) as bunpmBinConfig;
}
export async function updateBinConfig(newData: Partial<bunpmBinConfig>) {
  Bun.write(
    `${bunpmBinPath}/${bunpmBinConfigFileName}`,
    format({ ...(await getBinConfig()), ...newData })
  );
}

export async function updateConfig(new_config: Partial<bunpmConfig>) {
  const config = await getConfig();
  await Bun.write(bunConfigFileName, format({ ...config, ...new_config }));
}

export interface packageJsonDependencies {
  devDependencies?: { [key: string]: string };
  dependencies?: { [key: string]: string };
  peerDependencies?: { [key: string]: string };
}

interface packagejson extends packageJsonDependencies {
  name: string;
  version: string;
  module: string;
}

export async function getPackageJson() {
  return (await Bun.file("package.json").json()) as packagejson;
}
export async function updatePackageJson(newData: Partial<packagejson>) {
  await Bun.write(
    "package.json",
    format({ ...(await getPackageJson()), ...newData })
  );
}
