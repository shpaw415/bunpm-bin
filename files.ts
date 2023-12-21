import { format } from "prettier-package-json";

export const defaultPublish = ["package.json"];
const bunConfigFileName = "bunpm.json";

export interface bunpmConfig {
  include: string[];
  api_key?: string;
  version?: string;
}

export async function getConfig() {
  return (await Bun.file(bunConfigFileName).json()) as bunpmConfig;
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
