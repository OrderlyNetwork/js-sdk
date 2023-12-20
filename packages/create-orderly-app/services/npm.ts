import { execa } from "execa";

export type PackageManager = "npm" | "yarn" | "pnpm";

// License for `whichPm`
// The MIT License (MIT)
// Copyright (c) 2017-2022 Zoltan Kochan <z@kochan.io>
// https://github.com/zkochan/packages/tree/main/which-pm-runs
export function whichPm(): PackageManager {
  if (!process.env.npm_config_user_agent) {
    return "npm";
  }

  const pmSpec = process.env.npm_config_user_agent.split(" ")[0];
  const separatorPos = pmSpec.lastIndexOf("/");
  const name = pmSpec.substring(0, separatorPos);

  return name as PackageManager;
}

export async function getPackageManager(): Promise<PackageManager> {
  const pm = whichPm();

  if (!pm) {
    throw new Error("No package manager found");
  }
  return pm as PackageManager;
}

export async function addDependencies(
  dependencies: string[],
  {
    isDev = false,
    rootPath,
  }: {
    isDev: boolean;
    rootPath: string;
  }
): Promise<any> {
  const pm = await getPackageManager();
  let command: string;
  let args: string[];

  // console.log("------>>>>", pm);
  switch (pm) {
    case "npm":
      command = "npm";
      args = ["install", isDev ? "-D" : "-S", ...dependencies];

      break;
    case "yarn":
      command = "yarnpkg";
      args = ["add", "--cwd", ...dependencies, isDev ? "-D" : ""];
      break;
    case "pnpm":
      command = "pnpm";
      args = ["add", "--dir", ...dependencies, isDev ? "-D" : ""];
      break;
    default:
      throw new Error(`Unknown package manager: ${pm}`);
  }

  return await runCommand(command, args, rootPath);
}

export async function installDependencies(options: {
  rootPath: string;
}): Promise<any> {
  const pm = await getPackageManager();
  let command: string;
  let args: string[];
  // console.log("------>>>>", pm);
  switch (pm) {
    case "npm":
      command = "npm";
      args = ["install"];
      break;
    case "yarn":
      command = "yarnpkg";
      args = ["install"];
      break;
    case "pnpm":
      command = "pnpm";
      args = ["install"];
      break;
    default:
      throw new Error(`Unknown package manager: ${pm}`);
  }

  return await runCommand(command, args, options.rootPath);
}

async function runCommand(command: string, args: string[], rootPath: string) {
  return await execa(command, args, {
    cwd: rootPath,
  });
}
