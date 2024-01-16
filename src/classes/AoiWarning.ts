import chalk from "chalk";
import fetch from "node-fetch";
import { version } from "../../package.json";
import { execSync, spawn } from "node:child_process";

interface AoiWarningOptions {
  enableWarn?: boolean;
  autoUpdate?: boolean;
  enableDev?: boolean;
  enableBeta?: boolean;
}

function versionToArray(versionString: string) {
  return versionString.split(".").map(Number);
}

/**
 * A class to manage package updates and project restarts.
 */
class AoiWarning {
  autoUpdate: boolean;
  enableDev: boolean;
  enableBeta: boolean;

  /**
   * Constructs an instance of AoiWarning.
   * @param options - Configuration options for AoiWarning.
   */
  constructor(options: AoiWarningOptions = {}) {
    this.autoUpdate = options.autoUpdate || false;
    this.enableDev = options.enableDev || false;
    this.enableBeta = options.enableBeta || false;
    this.setupExitHandlers();
  }

  /**
   * Set up exit handlers for graceful process exit.
   */
  private setupExitHandlers() {
    if (!this.autoUpdate) return;

    process.on("SIGINT", () => {
      console.log(chalk.yellow("Received SIGINT. Exiting gracefully..."));
      process.exit(0);
    });
  }

  /**
   * Checks for available package updates and performs an update if enabled.
   */
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

  /**
   * Determines if an update should be checked based on current configuration and version.
   * @param latestVersion - The latest version available on npm.
   * @returns True if an update should be checked, otherwise false.
   */
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

  /**
   * Displays a colored update message based on version differences.
   * @param latestVersion - The latest version available on npm.
   */
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

  /**
   * Updates to the specified version and restarts the project.
   * @param version - The version to update to.
   */
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
