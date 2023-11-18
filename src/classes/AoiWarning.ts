import fetch from "node-fetch";
import chalk from "chalk";
import { version } from "../../package.json";

async function AoiWarning() {
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
    }
  } catch (error: any) {
    const messageError = error.response?.data.error;
    console.warn(
      chalk.red("[ AoiWarning ]: failed to check for updates: ") +
        chalk.yellow(messageError),
    );
  }
}

export { AoiWarning };
