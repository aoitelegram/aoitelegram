import fetch from "node-fetch";
import { version } from "../index";
import process from "node:process";
import { Logger } from "@aoitelegram/util";
import { execSync, spawn } from "node:child_process";

interface AoiWarningOptions {
  aoiWarning?: boolean;
  autoUpdate?: boolean;
  enableDev?: boolean;
  enableBeta?: boolean;
}

function versionToArray(versionString: string): number[] {
  return versionString.split(".").map(Number);
}

class AoiWarning {
  public readonly autoUpdate: boolean;
  public readonly enableDev: boolean;
  public readonly enableBeta: boolean;

  constructor(options: AoiWarningOptions = {}) {
    this.autoUpdate = options.autoUpdate || false;
    this.enableDev = options.enableDev || false;
    this.enableBeta = options.enableBeta || false;
  }

  async checkUpdates(): Promise<void> {
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
    } catch (err) {
      Logger.custom({
        title: { color: "red", text: "[ AoiWarning ]:" },
        args: [{ color: "red", text: `failed to check for updates: ${err}` }],
      });
    }
  }

  private shouldCheckForUpdate(latestVersion: string): boolean {
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

  private displayUpdateMessage(latestVersion: string): void {
    const currentVersionParts = versionToArray(version);
    const latestVersionParts = versionToArray(latestVersion);

    if (latestVersionParts[0] < currentVersionParts[0]) {
      Logger.custom({
        title: { color: "yellow", text: "[ AoiWarning ]:" },
        args: [{ color: "yellow", text: "Major update available!" }],
      });
    } else if (latestVersionParts[1] < currentVersionParts[1]) {
      Logger.custom({
        title: { color: "yellow", text: "[ AoiWarning ]:" },
        args: [{ color: "yellow", text: "Minor update available." }],
      });
    } else if (latestVersionParts[2] < currentVersionParts[2]) {
      Logger.custom({
        title: { color: "yellow", text: "[ AoiWarning ]:" },
        args: [{ color: "yellow", text: "Patch update available." }],
      });
    }
  }

  async updateToLatestVersion(version: string): Promise<void> {
    try {
      Logger.info("Updating to the latest version...");

      execSync(`npm i aoitelegram@${version} ${process.getuid?.() === 0 ? "" : "--no-bin-links"}`, {
        stdio: "inherit",
      });

      Logger.info("Exit the project...");
      process.exit();
    } catch (err) {
      Logger.custom({
        title: { color: "red", text: "[ AoiWarning ]:" },
        args: [
          {
            color: "red",
            text: `failed to update to the latest version: ${err}`,
          },
        ],
      });
    }
  }
}

export { AoiWarning, AoiWarningOptions };
