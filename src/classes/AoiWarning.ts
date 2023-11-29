import fetch from "node-fetch";
import chalk from "chalk";
import { version } from "../../package.json";
import { execSync, spawn } from "node:child_process";

/**
 * A class to manage package updates and project restarts.
 */
class AoiWarning {
  /**
   * Whether automatic updates are enabled.
   */
  autoUpdate: boolean;

  /**
   * Constructs an instance of AoiWarning.
   * @param autoUpdate - Whether automatic updates are enabled. Default is false.
   */
  constructor(autoUpdate = false) {
    this.autoUpdate = autoUpdate;
  }

  /**
   * Checks for available package updates and performs an update if enabled.
   */
  async checkUpdates() {
    try {
      const response = await fetch("https://registry.npmjs.org/aoitelegram");
      const responseData = await response.json();
      const latestVersion = responseData["dist-tags"].latest;

      if (latestVersion !== version) {
        console.warn(
          chalk.red("[ AoiWarning ]: ") +
            chalk.yellow(`v${latestVersion} is available to install.`) +
            " (" +
            chalk.red(`npm i aoitelegram@${latestVersion}`) +
            ")",
        );

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
   * Updates to the specified version and restarts the project.
   * @param version - The version to update to.
   */
  async updateToLatestVersion(version: string) {
    try {
      console.log(chalk.blue("Updating to the latest version..."));

      execSync(`npm i aoitelegram@${version} --no-bin-links`, {
        stdio: "inherit",
      });

      console.log(chalk.green("Restarting the project..."));

      process.on("exit", async () => {
        spawn(process.argv.shift() as string, process.argv, {
          cwd: process.cwd(),
          detached: true,
          stdio: "inherit",
        });
        console.log(chalk.green("Project successfully updated and restarted."));
      });

      process.exit();
    } catch (error) {
      console.error(
        chalk.red("[ AoiWarning ]: failed to update to the latest version: ") +
          chalk.yellow(error),
      );
    }
  }
}

export { AoiWarning };
