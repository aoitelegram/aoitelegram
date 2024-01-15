import chalk from "chalk";
import { AoijsError } from "./AoiError";
import { Collection } from "telegramsjs";
import { AoiWarning } from "./AoiWarning";
import { DataFunction } from "./AoiTyping";
import { CustomEvent } from "./CustomEvent";
import { LoadCommands } from "./LoadCommands";
import { KeyValueOptions } from "./AoiManager";
import { AoiBase, TelegramOptions } from "./AoiBase";
import { Action, ActionDescription } from "../helpers/Action";
import { TimeoutManager } from "../helpers/manager/TimeoutManager";
import { AwaitedManager } from "../helpers/manager/AwaitedManager";
import { MongoDBManagerOptions } from "./MongoDBManager";
import { Command, CommandDescription } from "../helpers/Command";
import { Timeout, TimeoutDescription } from "../helpers/Timeout";
import { Awaited, AwaitedDescription } from "../helpers/Awaited";
import { version } from "../../package.json";

interface CommandInfoSet {
  [key: string]: string;
}

type DatabaseOptions = {
  type?: "MongoDB" | "KeyValue";
} & MongoDBManagerOptions &
  KeyValueOptions;

/**
 * A class representing an AoiClient, which extends AoiBase.
 */
class AoiClient extends AoiBase {
  #optionLogging: boolean | undefined;
  #aoiWarning: boolean | undefined;
  #warningManager: AoiWarning;
  functionError: boolean | undefined;
  sendMessageError: boolean | undefined;
  registerCommand: Command = new Command(this);
  registerAction: Action = new Action(this);
  registerTimeout: Timeout = new Timeout(this);
  registerAwaited: Awaited = new Awaited(this);
  timeoutManager: TimeoutManager;
  awaitedManager: AwaitedManager;
  loadCommands?: LoadCommands;
  customEvent?: CustomEvent;
  commands: Collection<CommandInfoSet, unknown> = new Collection();
  globalVars: Collection<string, unknown> = new Collection();
  /**
   * Creates a new instance of AoiClient.
   * @param {Object} options - Configuration options for the client.
   * @param {string} options.token - The token for authentication.
   * @param {TelegramOptions} options.telegram - Options for the Telegram integration.
   * @param {DatabaseOptions} options.database - Options for the database.
   * @param {string[]} options.disableFunctions - Functions that will be removed from the library's loading functions.
   * @param {DataFunction[]} options.customFunction - An array of customFunction functions.
   * @param {boolean} options.functionError - For the error handler of functions.
   * @param {boolean} options.sendMessageError - To disable text errors.
   * @param {boolean} [options.logging] - Outputting system messages to the console.
   * @param {boolean} [options.aoiWarning] - Displaying messages about new versions.
   * @param {boolean} [options.autoUpdate] - Checks for available package updates and performs an update if enabled
   */
  constructor(options: {
    token: string;
    telegram?: TelegramOptions;
    database?: DatabaseOptions;
    disableFunctions?: string[];
    customFunction?: DataFunction[];
    functionError?: boolean;
    sendMessageError?: boolean;
    logging?: boolean;
    aoiWarning?: boolean;
    autoUpdate?: boolean;
  }) {
    super(
      options.token,
      options.telegram,
      options.database,
      options.customFunction,
      options.disableFunctions,
    );
    this.#optionLogging =
      options.logging === undefined ? true : options.logging;
    this.#aoiWarning =
      options.aoiWarning === undefined ? true : options.aoiWarning;
    this.#warningManager = new AoiWarning(
      options.autoUpdate === undefined ? false : options.autoUpdate,
    );
    this.functionError = options.functionError;
    this.sendMessageError = options.sendMessageError;
    this.timeoutManager = new TimeoutManager(this);
    this.awaitedManager = new AwaitedManager(this);
  }

  /**
   * Define a command for the client.
   * @param options - Command options.
   * @param options.name - The name of the command.
   * @param options.typeChannel- In what type of channels to watch command
   * @param options.code - The code to be executed when the command is invoked.
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
   * @param options - Command options.
   * @param options.data - The action data string or an array of action data strings.
   * @param options.answer - Whether to answer the action.
   * @param options.code - The code to be executed when the command is invoked.
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
   * @param options - Command options.
   * @param options.id - The unique identifier for the timeout command.
   * @param options.code - The code or content associated with the timeout command.
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
   * @param options - Options for the awaited command.
   * @param options.awaited - The name or identifier of the awaited event.
   * @param options.code - The code or content associated with the awaited command.
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
   * Adds a function error command to handle errors.
   * @param options - Options for the function error command.
   * @param options.code - The code to be executed on function error.
   */
  functionErrorCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("functionError", async (context, event) => {
      event.telegram.functionError = false;
      this.evaluateCommand({ event: "functionError" }, options.code, event);
      event.telegram.functionError = true;
    });
    return this;
  }

  /**
   * Connect to the service and perform initialization tasks.
   */
  async connect() {
    if (this.#aoiWarning) {
      await this.#warningManager.checkUpdates();
    }
    await this.registerCommand.handler();
    await this.registerAction.handler();
    await this.registerTimeout.handler();
    await this.registerAwaited.handler();
    if (this.#optionLogging) {
      this.on("ready", async (ctx) => {
        setTimeout(() => {
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
            `${chalk.yellow("[ Official Docs ]: ")}${chalk.blue(
              "https://aoitelegram.vercel.app/",
            )}`,
          );

          console.log(
            `${chalk.yellow("[ Official GitHub ]: ")}${chalk.blue(
              "https://github.com/Sempai-07/aoitelegram/issues",
            )}`,
          );
        }, 4000);
      });
    }
    super.login();
  }

  /**
   * Updates information about a command set with the provided name.
   * @param name - The name of the command set to update.
   * @param commands - The new information to set for the command set.
   */
  #commandInfo(name: CommandInfoSet, commands: unknown) {
    this.commands.set(name, commands);
  }
}

export { AoiClient, DatabaseOptions };
