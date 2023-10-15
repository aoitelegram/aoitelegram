import chalk from "chalk";
import { AoiBase, TelegramOptions } from "./AoiBase";
import { AoijsError } from "./AoiError";
import { AoiManager, DatabaseOptions } from "./AoiManager";

/**
 * A class representing an AoiClient, which extends AoiBase.
 */
class AoiClient extends AoiBase {
  #database: AoiManager;
  /**
   * Creates a new instance of AoiClient.
   * @param {string} token - The token for authentication.
   * @param {Object} options - Configuration options for the client.
   * @param {TelegramOptions} options.telegram - Options for the Telegram integration.
   * @param {DatabaseOptions} options.database - Options for the database.
   */
  constructor(
    token: string,
    options: {
      telegram?: TelegramOptions;
      database?: DatabaseOptions;
    } = {},
  ) {
    super(token, options.telegram);
    this.#database = new AoiManager(options.database);
  }

  /**
   * Define a command for the client.
   * @param {Object} options - Command options.
   * @param {string} options.name - The name of the command.
   * @param {string} options.code - The code to be executed when the command is invoked.
   */
  // @ts-ignore
  command(options: { name: string; code: string }) {
    if (!options?.name)
      throw new AoijsError("parameter", "You did not specify the 'name' parameter.");
    if (!options?.code)
      throw new AoijsError("parameter", "You did not specify the 'code' parameter.");
    super.command(options.name, (ctx) => {
      this.runCode(options.name, options.code, ctx);
    });
  }

  /**
   * Set variables in the database.
   * @param {Object} options - Key-value pairs of variables to set.
   * @param {string} table - The database table to use (optional).
   */
  async variables(options: { [key: string]: unknown }, table?: string) {
    await this.#database.variables(options, table);
  }

  /**
   * Connect to the service and perform initialization tasks.
   */
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
