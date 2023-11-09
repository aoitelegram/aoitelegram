import chalk from "chalk";
import { DataFunction } from "context";
import { Collection } from "telegramsjs";
import { AoiBase, TelegramOptions } from "./AoiBase";
import { AoiWarning } from "./AoiWarning";
import { DatabaseOptions } from "./AoiManager";
import { AoijsError } from "./AoiError";

type CommandInfoSet = { data: string } | { name: string };

interface CommandThis {
  name: string;
  typeChannel?:
    | false
    | "private"
    | "group"
    | "supergroup"
    | "channel"
    | undefined;
  code: string;
}

interface ActionThis {
  data: string;
  answer?: boolean;
  code: string;
}

/**
 * A class representing an AoiClient, which extends AoiBase.
 */
class AoiClient extends AoiBase {
  #optionConsole: boolean | undefined;
  #aoiwarning: boolean | undefined;
  private commands: Collection<CommandInfoSet, unknown> = new Collection();
  private globalVars: Collection<string, unknown> = new Collection();
  /**
   * Creates a new instance of AoiClient.
   * @param {Object} options - Configuration options for the client.
   * @param {string} token - The token for authentication.
   * @param {TelegramOptions} options.telegram - Options for the Telegram integration.
   * @param {DatabaseOptions} options.database - Options for the database.
   * @param {DataFunction[]} options.plugin - an array of plugin functions.
   * @param {boolean} [options.console] - Outputting system messages to the console.
   * @param {boolean} [options.aoiwarning] - Displaying messages about new versions.
   */
  constructor(options: {
    token: string;
    telegram?: TelegramOptions;
    database?: DatabaseOptions;
    plugin?: DataFunction[];
    console?: boolean;
    aoiwarning?: boolean;
  }) {
    super(options.token, options.telegram, options.database, options.plugin);
    this.#optionConsole =
      options.console === undefined ? true : options.console;
    this.#aoiwarning =
      options.aoiwarning === undefined ? true : options.aoiwarning;
  }

  /**
   * Define a command for the client.
   * @param {Object} options - Command options.
   * @param {string} options.name - The name of the command.
   * @param {string | boolean} [options.typeChannel=false] - In what type of channels to watch command
   * @param {string} options.code - The code to be executed when the command is invoked.
   */
  command(options: CommandThis) {
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
    this.telegram.command(
      options.name,
      (ctx) => {
        this.runCode(options.name, options.code, ctx);
      },
      options.typeChannel,
    );
    this.#commandInfo({ name: `${options.name}` }, { ...options });
    return this;
  }

  /**
   * Defines an action handler.
   * @param {string} data - The action data string or an array of action data strings.
   * @param {boolean} [answer=false] - Whether to answer the action.
   * @param {string} options.code - The code to be executed when the command is invoked.
   */
  action(options: ActionThis) {
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
    this.telegram.action(
      options.data,
      (ctx) => {
        this.runCode(options.data, options.code, ctx);
      },
      options.answer,
    );
    this.#commandInfo({ data: options.data }, { ...options });
    return this;
  }

  /**
   * Connect to the service and perform initialization tasks.
   */
  async connect() {
    this.telegram.login();
    if (this.#optionConsole) {
      this.telegram.on("ready", async (ctx) => {
        if (this.#aoiwarning) {
          await AoiWarning();
        }

        new Promise((res) => {
          setTimeout(() => {
            const version = require("../../package.json").version;
            const ctxUsername = `@${ctx.username}`;

            console.log(
              `${chalk.red("[ AoiClient ]: ")}${chalk.yellow(
                `Initialized on ${chalk.cyan("aoitelegram")} ${chalk.blue(
                  `v${version}`,
                )}`,
              )} | ${chalk.green(ctxUsername)} |${chalk.cyan(
                " Sempai Development",
              )}`,
            );

            console.log(
              `${chalk.yellow("Official GitHub: ")}${chalk.blue(
                "https://github.com/Sempai-07/aoitelegram/issues",
              )}`,
            );

            res("");
          }, 5 * 1000);
        });
      });
    }
  }

  /**
   * Updates information about a command set with the provided name.
   * @param {CommandInfoSet} name - The name of the command set to update.
   * @param {unknown} commands - The new information to set for the command set.
   */
  #commandInfo(name: CommandInfoSet, commands: unknown) {
    this.commands.set(name, commands);
  }
}

export { AoiClient };
