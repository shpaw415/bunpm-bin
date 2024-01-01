import fs from "fs";
import { homedir } from "os";
import { colorConsoleText } from "../bun_module/console";

export async function Upgrade({ version }: { version: string }) {
  const bunpm_new_path = `${homedir()}/.bunpm/bin/bunpm.new`;
  const bunpm_old_path = `${homedir()}/.bunpm/bin/bunpm`;

  const res = await fetch(
    `${process.env.BASE_URL}/api/v1/bin/version?version=${version}`
  );
  if (!res.ok) return console.log("cannot get build version!");
  const data = (await res.json()) as { status: boolean; version: string };
  if (data.status) return console.log("your version of bunpm is up to date");

  console.log(
    `Yeah! a new version is lauched...\nDownloading version: ${colorConsoleText(
      data.version,
      "cyan"
    )}`
  );

  const bunpm_bin = await fetch(`${process.env.BASE_URL}/bin/bunpm`);
  if (!bunpm_bin.ok) return console.log("cannot download the new version");

  if (fs.existsSync(bunpm_new_path)) fs.rmSync(bunpm_new_path);
  fs.writeFileSync(bunpm_new_path, "");

  await Bun.write(bunpm_new_path, await bunpm_bin.arrayBuffer());
  console.log("Installing...");
  fs.rmSync(bunpm_old_path);
  fs.renameSync(bunpm_new_path, bunpm_old_path);
  fs.chmodSync(bunpm_old_path, "0770");
  return data.version;
}
