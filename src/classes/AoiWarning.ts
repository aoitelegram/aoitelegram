import axios from "axios";
import chalk from "chalk";
import { version } from "../../package.json";

async function AoiWarning() {
  try {
    const response = await axios.get("https://registry.npmjs.org/aoitelegram");
    const resData = response.data["dist-tags"].latest;

    if (version !== resData) {
      console.warn(
        chalk.red("[ AoiWarning ]: ") +
          chalk.yellow(`v${resData} is available to install.`) +
          " (" +
          chalk.red(`npm i aoitelegram@${resData}`) +
          ")",
      );
    }
  } catch (error) {
    const messageError = (error as { response: { data: { error: string } } })
      .response?.data.error;
    console.warn(
      chalk.red("[ AoiWarning ]: failed to check for updates: ") +
        chalk.yellow(messageError),
    );
  }
}

export { AoiWarning };
