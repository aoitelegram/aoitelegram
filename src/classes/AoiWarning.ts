import chalk from "chalk";
import fetch from "node-fetch";
import { version } from "../index";
import { execSync, spawn } from "node:child_process";

interface AoiWarningOptions {
  aoiWarning?: boolean;
  autoUpdate?: boolean;
  enableDev?: boolean;
  enableBeta?: boolean;
}

function versionToArray(versionString: string) {
  return versionString.split(".").map(Number);
}

class AoiWarning {
  autoUpdate: boolean;
  enableDev: boolean;
  enableBeta: boolean;

  constructor(options: AoiWarningOptions = {}) {
    this.autoUpdate = options.autoUpdate || false;
    this.enableDev = options.enableDev || false;
    this.enableBeta = options.enableBeta || false;
  }

  async checkUpdates() {
    try {
      const response = await fetch("https://registry.npmjs.org/aoitelegram");
      const responseData = await response.json();
      const latestVersion = responseData["dist-tags"].latest;

      if (this.shouldCheckForUpdate(latestVersion)) {
        this.displayUpdateMessage(latestVersion);

        if (this.autoUpdate) {
          await this.updateToLatestVersion(latestVersion);
        }
      }
    } catch (error) {
      console.warn(
        chalk.red("[ AoiWarning ]: failed to check for updates: ") +
          chalk.yellow(error),
      );
    }
  }

  private shouldCheckForUpdate(latestVersion: string) {
    const isBetaEnabled = this.enableBeta;
    const isDevEnabled = this.enableDev;
    const isLatestVersionBeta = latestVersion.includes("beta");
    const isLatestVersionDev = latestVersion.includes("dev");

    return (
      (isBetaEnabled === true && isLatestVersionBeta === true) ||
      (isDevEnabled === true && isLatestVersionDev === true) ||
      (!isLatestVersionDev && !isLatestVersionBeta && latestVersion !== version)
    );
  }

  private displayUpdateMessage(latestVersion: string) {
    const currentVersionParts = versionToArray(version);
    const latestVersionParts = versionToArray(latestVersion);

    const warningLabel = chalk.green("[ AoiWarning ]:");

    if (latestVersionParts[0] < currentVersionParts[0]) {
      console.warn(`${warningLabel} Major update available!`);
    } else if (latestVersionParts[1] < currentVersionParts[1]) {
      console.warn(`${warningLabel} Minor update available.`);
    } else if (latestVersionParts[2] < currentVersionParts[2]) {
      console.warn(`${warningLabel} Patch update available.`);
    }
  }

  async updateToLatestVersion(version: string) {
    try {
      console.log(chalk.blue("Updating to the latest version..."));

      execSync(`npm i aoitelegram@${version} --no-bin-links`, {
        stdio: "inherit",
      });

      console.log(chalk.green("Exit the project..."));
      process.exit();
    } catch (error) {
      console.error(
        chalk.red("[ AoiWarning ]: failed to update to the latest version: ") +
          chalk.yellow(error),
      );
    }
  }
}

export { AoiWarning, AoiWarningOptions };
