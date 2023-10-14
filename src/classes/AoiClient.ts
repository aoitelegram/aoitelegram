import chalk from "chalk";
import { AoiBase } from "./AoiBase";
import { AoijsError } from "./AoiError";

class AoiClient extends AoiBase {
  constructor(token: string) {
    super(token);
    super.on("ready", () => {
      new Promise((res) =>
        setTimeout(() => {
          console.log(
            `\n${chalk.red("[ Developer ]:")} ${chalk.yellow(
              "If the error occurred not due to your fault but because of an external library, please make sure to report this error to: ",
            )}${chalk.blue("https://github.com/Sempai-07/aoitelegram/issues")}`,
          );
          res("");
        }, 5 * 1000),
      );
    });
  }

  // @ts-ignore
  command(options: { name: string; code: string }) {
    if (!options?.name)
      throw new AoijsError("You did not specify the 'name' parameter.");
    if (!options?.code)
      throw new AoijsError("You did not specify the 'code' parameter.");
    super.command(options.name, (ctx) => {
      this.runCode(options.name, options.code, ctx);
    });
  }

  connect() {
    super.login();
  }
}

export { AoiClient };
