import chalk from "chalk";
import { DataFunction } from "context";
import { AoiBase, TelegramOptions } from "./AoiBase";
import { DatabaseOptions } from "./AoiManager";
import { AoijsError } from "./AoiError";

/**
 * A class representing an AoiClient, which extends AoiBase.
 */
class AoiClient extends AoiBase {
  #optionConsole: boolean | undefined;
  /**
   * Creates a new instance of AoiClient.
   * @param {Object} options - Configuration options for the client.
   * @param {string} token - The token for authentication.
   * @param {TelegramOptions} options.telegram - Options for the Telegram integration.
   * @param {DatabaseOptions} options.database - Options for the database.
   * @param {DataFunction[]} options.plugin An array of plugin functions.
   */
  constructor(options: {
    token: string;
    telegram?: TelegramOptions;
    database?: DatabaseOptions;
    plugin?: DataFunction[];
    console?: boolean;
  }) {
    super(options.token, options.telegram, options.database, options.plugin);
    this.#optionConsole =
      options.console === undefined ? true : options.console;
  }

  /**
   * Define a command for the client.
   * @param {Object} options - Command options.
   * @param {string} options.name - The name of the command.
   * @param {string | boolean} [options.typeChannel=false] - In what type of channels to watch command
   * @param {string} options.code - The code to be executed when the command is invoked.
   */
  // @ts-ignore
  command(options: {
    name: string;
    typeChannel?:
      | false
      | "private"
      | "group"
      | "supergroup"
      | "channel"
      | undefined;
    code: string;
  }) {
    if (!options?.name) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'name' parameter.",
      );
    }
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'code' parameter.",
      );
    }
    super.command(
      options.name,
      (ctx) => {
        this.runCode(options.name, options.code, ctx);
      },
      options.typeChannel,
    );
  }

  /**
   * Defines an action handler.
   * @param {string} data - The action data string or an array of action data strings.
   * @param {boolean} [answer=false] - Whether to answer the action.
   * @param {string} options.code - The code to be executed when the command is invoked.
   */
  // @ts-ignore
  action(options: { data: string; answer?: boolean; code: string }) {
    if (!options?.data) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'data' parameter.",
      );
    }
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'code' parameter.",
      );
    }
    super.action(
      options.data,
      (ctx) => {
        this.runCode(options.data, options.code, ctx);
      },
      options.answer,
    );
  }

  /**
   * Connect to the service and perform initialization tasks.
   */
  connect() {
    this.login();
    if (this.#optionConsole) {
      this.on("ready", (ctx) => {
        new Promise((res) =>
          setTimeout(() => {
            console.log(
              "\x1b[31mAoiClient: " +
                "\x1b[33mInitialized on \x1b[36maoitelegram \x1b[34mv" +
                require("../../package.json").version +
                `\x1b[0m || \x1b[32m${`@${ctx.username}`}` +
                "\x1b[0m || \x1b[36mSempai Development\x1b[0m",
            );
            console.log(
              "\x1b[33mOfficial GitHub: https://github.com/Sempai-07/aoitelegram/issues\x1b[0m",
            );
            //           console.log(
            //             `\n${chalk.red("[ Developer ]:")} ${chalk.yellow(
            //               "If the error occurred not due to your fault but because of an external library, please make sure to report this error to: ",
            //             )}${chalk.blue("https://github.com/Sempai-07/aoitelegram/issues")}`,
            //           );
            res("");
          }, 5 * 1000),
        );
      });
    }
  }
}

export { AoiClient };
