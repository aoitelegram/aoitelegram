import chalk from "chalk";
import { Collection } from "telegramsjs";
import { AoijsError } from "./AoiError";
import { AoiWarning } from "./AoiWarning";
import { DatabaseOptions } from "./AoiManager";
import { TimeoutManager } from "../helpers/manager/TimeoutManager";
import { AwaitedManager } from "../helpers/manager/AwaitedManager";
import { AoiBase, DataFunction, TelegramOptions } from "./AoiBase";
import { Command, CommandDescription } from "../helpers/Command";
import { Action, ActionDescription } from "../helpers/Action";
import { Timeout, TimeoutDescription } from "../helpers/Timeout";
import { Awaited, AwaitedDescription } from "../helpers/Awaited";

interface CommandInfoSet {
  [key: string]: string;
}

/**
 * A class representing an AoiClient, which extends AoiBase.
 */
class AoiClient extends AoiBase {
  #optionConsole: boolean | undefined;
  #aoiwarning: boolean | undefined;
  #warningmanager: AoiWarning;
  registerCommand: Command = new Command(this);
  registerAction: Action = new Action(this);
  registerTimeout: Timeout = new Timeout(this);
  registerAwaited: Awaited = new Awaited(this);
  timeoutManager: TimeoutManager;
  awaitedManager: AwaitedManager;
  private commands: Collection<CommandInfoSet, unknown> = new Collection();
  private globalVars: Collection<string, unknown> = new Collection();
  /**
   * Creates a new instance of AoiClient.
   * @param {Object} options - Configuration options for the client.
   * @param {string} token - The token for authentication.
   * @param {TelegramOptions} options.telegram - Options for the Telegram integration.
   * @param {DatabaseOptions} options.database - Options for the database.
   * @param {DataFunction[]} options.customFunction - an array of customFunction functions.
   * @param {boolean} [options.console] - Outputting system messages to the console.
   * @param {boolean} [options.aoiwarning] - Displaying messages about new versions.
   * @param {boolean} [options.autoUpdate] - Checks for available package updates and performs an update if enabled
   */
  constructor(options: {
    token: string;
    telegram?: TelegramOptions;
    database?: DatabaseOptions;
    customFunction?: DataFunction[];
    console?: boolean;
    aoiwarning?: boolean;
    autoUpdate?: boolean;
  }) {
    super(
      options.token,
      options.telegram,
      options.database,
      options.customFunction,
    );
    this.#optionConsole =
      options.console === undefined ? true : options.console;
    this.#aoiwarning =
      options.aoiwarning === undefined ? true : options.aoiwarning;
    this.#warningmanager = new AoiWarning(
      options.autoUpdate === undefined ? false : options.autoUpdate,
    );
    this.timeoutManager = new TimeoutManager(this, options.database);
    this.awaitedManager = new AwaitedManager(this);
  }

  /**
   * Define a command for the client.
   * @param {CommandDescription} options - Command options.
   * @param {string} options.name - The name of the command.
   * @param {string | boolean} [options.typeChannel=false] - In what type of channels to watch command
   * @param {string} options.code - The code to be executed when the command is invoked.
   */
  // @ts-ignore
  command(options: CommandDescription) {
    if (!options?.name) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'name' parameter",
      );
    }
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.registerCommand.register(options);
    this.#commandInfo({ name: `/${options.name}` }, { ...options });
    return this;
  }

  /**
   * Defines an action handler.
   * @param {ActionDescription} options - Command options.
   * @param {string} options.data - The action data string or an array of action data strings.
   * @param {boolean} [options.answer=false] - Whether to answer the action.
   * @param {string} options.code - The code to be executed when the command is invoked.
   */
  // @ts-ignore
  action(options: ActionDescription) {
    if (!options?.data) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'data' parameter",
      );
    }
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.registerAction.register(options);
    this.#commandInfo({ data: options.data }, { ...options });
    return this;
  }

  /**
   * Defines an timeout handler.
   * @param {TimeoutDescription} options - Command options.
   * @param {string} options.id - The unique identifier for the timeout command.
   * @param {string} options.code - The code or content associated with the timeout command.
   */
  timeoutCommand(options: TimeoutDescription) {
    if (!options?.id) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'id' parameter",
      );
    }
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.registerTimeout.register(options);
    this.#commandInfo({ id: options.id }, { ...options });
    return this;
  }

  /**
   * Adds an awaited command with the specified options.
   * @param {AwaitedDescription} options - Options for the awaited command.
   * @param {string} options.awaited - The name or identifier of the awaited event.
   * @param {string} options.code - The code or content associated with the awaited command.
   */
  awaitedCommand(options: AwaitedDescription) {
    if (!options?.awaited) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'awaited' parameter",
      );
    }
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.registerAwaited.register(options);
    this.#commandInfo({ awaited: options.awaited }, { ...options });

    return this;
  }

  /**
   * Connect to the service and perform initialization tasks.
   */
  async connect() {
    await this.registerCommand.handler();
    await this.registerAction.handler();
    await this.registerTimeout.handler();
    await this.registerAwaited.handler();
    if (this.#aoiwarning) {
      await this.#warningmanager.checkUpdates();
    }
    if (this.#optionConsole) {
      this.on("ready", async (ctx) => {
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
          }, 4 * 1000);
        });
      });
    }
    super.login();
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
