import chalk from "chalk";
import { AoijsError } from "./AoiError.js";
import { Collection } from "telegramsjs";
import { DataFunction } from "./AoiTyping.js";
import { CustomEvent } from "./CustomEvent.js";
import { LoadCommands } from "./LoadCommands.js";
import { KeyValueOptions } from "./AoiManager.js";
import { toConvertParse } from "../function/parser.js";
import { AoiBase, TelegramOptions } from "./AoiBase.js";
import { AoiWarning, AoiWarningOptions } from "./AoiWarning.js";
import { Action, ActionDescription } from "../helpers/Action.js";
import { Callback, CallbackDescription } from "../helpers/Callback.js";
import { TimeoutManager } from "../helpers/manager/TimeoutManager.js";
import { AwaitedManager } from "../helpers/manager/AwaitedManager.js";
import { MongoDBManagerOptions } from "./MongoDBManager.js";
import { Command, CommandDescription } from "../helpers/Command.js";
import { Timeout, TimeoutDescription } from "../helpers/Timeout.js";
import { Awaited, AwaitedDescription } from "../helpers/Awaited.js";
import { version } from "../index.js";

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
  registerCallback: Callback = new Callback(this);
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
   * @param options - Configuration options for the client.
   * @param options.token - The token for authentication.
   * @param options.telegram - Options for the Telegram integration.
   * @param options.database - Options for the database.
   * @param options.disableFunctions - Functions that will be removed from the library's loading functions.
   * @param options.customFunction - An array of customFunction functions.
   * @param options.functionError - For the error handler of functions.
   * @param options.sendMessageError - To disable text errors.
   * @param options.disableAoiDB - Disabled built-in database.
   * @param options.logging - Outputting system messages to the console.
   * @param options.autoUpdate - Checks for available package updates and performs an update if enabled
   */
  constructor(options: {
    token: string;
    telegram?: TelegramOptions;
    database?: DatabaseOptions;
    disableFunctions?: string[];
    customFunction?: DataFunction[];
    functionError?: boolean;
    sendMessageError?: boolean;
    disableAoiDB?: boolean;
    logging?: boolean;
    autoUpdate?: AoiWarningOptions;
  }) {
    super(
      options.token,
      options.telegram,
      options.database,
      options.customFunction,
      options.disableFunctions,
      options.disableAoiDB,
    );
    this.#optionLogging =
      options.logging === undefined ? true : options.logging;
    this.#aoiWarning = options.autoUpdate?.aoiWarning;
    this.#warningManager = new AoiWarning(options.autoUpdate || {});
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
  addCommand(options: CommandDescription) {
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
  addAction(options: ActionDescription) {
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
   * Adds a callback with specified options to the AoiClient.
   * @param options - The callback description containing 'name', 'type', and additional parameters based on the type.
   * @returns The AoiClient instance for method chaining.
   */
  addCallback(options: CallbackDescription) {
    if (!options?.name) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'name' parameter.",
      );
    }

    if (options.type === "aoitelegram" && !options?.code) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'code' parameter.",
      );
    }

    if (options.type === "js" && !options?.callback) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'callback' parameter.",
      );
    }

    this.registerCallback.register(options);
    this.#commandInfo({ callback: options.name }, { ...options });

    return this;
  }

  /**
   * Adds native functions to the command handler.
   * @param options An array of functions to add as native commands.
   * @returns Returns the current instance of the command handler.
   */
  addNative(options: Function[]) {
    if (!Array.isArray(options)) {
      throw new AoijsError(
        "parameter",
        "the parameter should contain an array of functions",
      );
    }

    const allFuncs = options.every(
      (func) => typeof func === "function" && func.name !== "",
    );
    if (!allFuncs) {
      throw new AoijsError(
        "parameter",
        "the parameter should contain an array of functions",
      );
    }

    for (const func of options) {
      this.addFunction({
        name: `$${func.name}`,
        callback: async (context) => {
          const splitsParsed = context.splits.map(toConvertParse);
          const result = await func(context, ...splitsParsed);
          return typeof result === "object" && result !== null
            ? JSON.stringify({ ...result })
            : result;
        },
      });
    }
    return this;
  }

  /**
   * Adds a function error command to handle errors.
   * @param options - Options for the function error command.
   * @param options.code - The code to be executed on function error.
   * @param options.useNative - The native functions to the command handler.
   */
  functionErrorCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("functionError", async (context, event) => {
      event.telegram.functionError = false;
      this.evaluateCommand(
        { event: "functionError" },
        options.code,
        event,
        options.useNative,
      );
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
    await super.login();
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
