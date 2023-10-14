import chalk from "chalk";
import { AoiBase } from "./AoiBase";
import { AoijsError } from "./AoiError";
import { AoiManager, DatabaseOptions } from "./AoiManager";

class AoiClient extends AoiBase {
  #database: AoiManager;
  constructor(
    token: string,
    options: {
      database?: DatabaseOptions;
    } = {},
  ) {
    super(token);
    this.#database = new AoiManager(options.database);
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

  async variables(options: { [key: string]: unknown }, table?: string) {
    await this.#database.variables(options, table);
  }

  connect() {
    this.login();
    this.on("ready", () => {
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
}

export { AoiClient };
