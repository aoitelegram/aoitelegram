import chalk from "chalk";
import process from "node:process";
import { AoijsError } from "./AoiError";
import { Collection } from "telegramsjs";
import { DataFunction } from "./AoiTyping";
import { CustomEvent } from "./CustomEvent";
import { AoiExtension } from "./AoiExtension";
import { LoadCommands } from "./LoadCommands";
import { KeyValueOptions } from "./AoiManager";
import { MongoDBManager } from "./MongoDBManager";
import { toConvertParse } from "../function/parser";
import { AoiBase, TelegramOptions } from "./AoiBase";
import { AoiWarning, AoiWarningOptions } from "./AoiWarning";
import { Action, ActionDescription } from "../helpers/Action";
import { Callback, CallbackDescription } from "../helpers/Callback";
import { TimeoutManager } from "../helpers/manager/TimeoutManager";
import { AwaitedManager } from "../helpers/manager/AwaitedManager";
import { MongoDBManagerOptions } from "./MongoDBManager";
import { Command, CommandDescription } from "../helpers/Command";
import { Timeout, TimeoutDescription } from "../helpers/Timeout";
import { Awaited, AwaitedDescription } from "../helpers/Awaited";
import { version } from "../index";

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
  warningManager: AoiWarning;
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
  autoUpdate?: AoiWarningOptions;
  extensions?: AoiExtension[];
  logging?: boolean;
  commands: Collection<CommandInfoSet, unknown> = new Collection();
  globalVars: Collection<string, unknown> = new Collection();
  /**
   * Creates a new instance of AoiClient.
   * @param options - Configuration options for the client.
   * @param options.token - The token for authentication.
   * @param options.telegram - Options for the Telegram integration.
   * @param options.database - Options for the database.
   * @param options.disableFunctions - Functions that will be removed from the library's loading functions.
   * @param options.native - Adds native functions to the command handler.
   * @param options.extensions - An array of AoiExtension functions.
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
    native?: Function[];
    extension?: AoiExtension[];
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
      options.disableFunctions,
      options.disableAoiDB,
    );

    const allAoiExtends = options.extension?.every(
      (cls) => cls instanceof AoiExtension,
    );
    if (!allAoiExtends && options.extension?.length) {
      throw new AoijsError(
        "extensions",
        "in the parameter 'extension', all classes should be inherited from the class 'AoiExtension'",
      );
    }

    this.warningManager = new AoiWarning(options.autoUpdate || {});
    this.logging = options.logging;
    this.extensions = options.extension;
    this.autoUpdate = options.autoUpdate;
    this.functionError = options.functionError;
    this.sendMessageError = options.sendMessageError;
    this.timeoutManager = new TimeoutManager(this);
    this.awaitedManager = new AwaitedManager(this);
    this.addNative(options.native || []);
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
    this.commands.set({ name: `/${options.name}` }, { ...options });
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
    this.commands.set({ data: options.data }, { ...options });
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
    this.commands.set({ id: options.id }, { ...options });
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
    this.commands.set({ awaited: options.awaited }, { ...options });

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
    this.commands.set({ callback: options.name }, { ...options });

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
          const result = await func(context, splitsParsed);
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
    if (this.autoUpdate?.aoiWarning) {
      await this.warningManager.checkUpdates();
    }
    this.registerCommand.handler();
    this.registerAction.handler();
    this.registerTimeout.handler();
    this.registerAwaited.handler();

    if (this.extensions?.length) {
      for (let i = 0; i < this.extensions.length; i++) {
        const initPlugins = this.extensions[i];
        try {
          await initPlugins["initPlugins"](this);
        } catch (err) {
          console.log(err);
        }
      }
    }

    if (this.logging === undefined || this.logging) {
      this.on("ready", (ctx) => {
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
      });
    }
    super.login();
  }
}

export { AoiClient, DatabaseOptions };
