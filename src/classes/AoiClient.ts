import chalk from "chalk";
import aoiStart from "../utils/AoiStart";
import { AoijsError } from "./AoiError";
import { AoiLogger } from "./AoiLogger";
import { Collection } from "telegramsjs";
import { DataFunction } from "./AoiTyping";
import { CustomEvent } from "./CustomEvent";
import { AoiExtension } from "./AoiExtension";
import { LoadCommands } from "./LoadCommands";
import { KeyValueOptions } from "./AoiManager";
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
  customEvent?: CustomEvent;
  warningManager: AoiWarning;
  loadCommands?: LoadCommands;
  timeoutManager: TimeoutManager;
  awaitedManager: AwaitedManager;
  functionError: boolean | undefined;
  sendMessageError: boolean | undefined;
  registerAction: Action = new Action(this);
  registerAwaited: Awaited = new Awaited(this);
  registerTimeout: Timeout = new Timeout(this);
  registerCommand: Command = new Command(this);
  registerCallback: Callback = new Callback(this);
  commands: Collection<CommandInfoSet, unknown> = new Collection();
  globalVars: Collection<string, unknown> = new Collection();
  /**
   * Creates a new instance of AoiClient.
   * @param parameters - Configuration parameters for the client.
   * @param parameters.token - The token for authentication.
   * @param parameters.telegram - Options for the Telegram integration.
   * @param parameters.database - Options for the database.
   * @param parameters.disableFunctions - Functions that will be removed from the library's loading functions.
   * @param parameters.native - Adds native functions to the command handler.
   * @param parameters.extensions - An array of AoiExtension functions.
   * @param parameters.functionError - For the error handler of functions.
   * @param parameters.sendMessageError - To disable text errors.
   * @param parameters.disableAoiDB - Disabled built-in database.
   * @param parameters.logging - Outputting system messages to the console.
   * @param parameters.autoUpdate - Checks for available package updates and performs an update if enabled
   */
  constructor(
    public readonly parameters: {
      token: string;
      telegram?: TelegramOptions;
      database?: DatabaseOptions;
      disableFunctions?: string[];
      native?: Function[];
      extensions?: AoiExtension[];
      functionError?: boolean;
      sendMessageError?: boolean;
      disableAoiDB?: boolean;
      logging?: boolean;
      autoUpdate?: AoiWarningOptions;
    },
  ) {
    super(
      parameters.token,
      parameters.telegram,
      parameters.database,
      parameters.disableFunctions,
      parameters.disableAoiDB,
    );

    const allAoiExtends = parameters.extensions?.every(
      (cls) => cls instanceof AoiExtension,
    );
    if (!allAoiExtends && parameters.extensions?.length) {
      throw new AoijsError(
        "extensions",
        "in the parameter 'extensions', all classes should be inherited from the class 'AoiExtension'",
      );
    }

    this.warningManager = new AoiWarning(parameters.autoUpdate || {});
    this.functionError = parameters.functionError;
    this.sendMessageError = parameters.sendMessageError;
    this.timeoutManager = new TimeoutManager(this);
    this.awaitedManager = new AwaitedManager(this);
    this.addNative(parameters.native || []);
  }

  /**
   * Define a command for the client.
   * @param parameters - Command parameters.
   * @param parameters.name - The name of the command.
   * @param parameters.typeChannel- In what type of channels to watch command
   * @param parameters.code - The code to be executed when the command is invoked.
   */
  addCommand(parameters: CommandDescription) {
    if (!parameters?.name) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'name' parameter",
      );
    }
    if (!parameters?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.registerCommand.register(parameters);
    this.commands.set({ name: `/${parameters.name}` }, { ...parameters });
    return this;
  }

  /**
   * Defines an action handler.
   * @param parameters - Command parameters.
   * @param parameters.data - The action data string or an array of action data strings.
   * @param parameters.answer - Whether to answer the action.
   * @param parameters.code - The code to be executed when the command is invoked.
   */
  addAction(parameters: ActionDescription) {
    if (!parameters?.data) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'data' parameter",
      );
    }
    if (!parameters?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.registerAction.register(parameters);
    this.commands.set({ data: parameters.data }, { ...parameters });
    return this;
  }

  /**
   * Defines an timeout handler.
   * @param parameters - Command parameters.
   * @param parameters.id - The unique identifier for the timeout command.
   * @param parameters.code - The code or content associated with the timeout command.
   */
  timeoutCommand(parameters: TimeoutDescription) {
    if (!parameters?.id) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'id' parameter",
      );
    }
    if (!parameters?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.registerTimeout.register(parameters);
    this.commands.set({ id: parameters.id }, { ...parameters });
    return this;
  }

  /**
   * Adds an awaited command with the specified parameters.
   * @param parameters - Options for the awaited command.
   * @param parameters.awaited - The name or identifier of the awaited event.
   * @param parameters.code - The code or content associated with the awaited command.
   */
  awaitedCommand(parameters: AwaitedDescription) {
    if (!parameters?.awaited) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'awaited' parameter",
      );
    }
    if (!parameters?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.registerAwaited.register(parameters);
    this.commands.set({ awaited: parameters.awaited }, { ...parameters });

    return this;
  }

  /**
   * Adds a callback with specified parameters to the AoiClient.
   * @param parameters - The callback description containing 'name', 'type', and additional parameters based on the type.
   * @returns The AoiClient instance for method chaining.
   */
  addCallback(parameters: CallbackDescription) {
    if (!parameters?.name) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'name' parameter.",
      );
    }

    if (parameters.type === "aoitelegram" && !parameters?.code) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'code' parameter.",
      );
    }

    if (parameters.type === "js" && !parameters?.callback) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'callback' parameter.",
      );
    }

    this.registerCallback.register(parameters);
    this.commands.set({ callback: parameters.name }, { ...parameters });

    return this;
  }

  /**
   * Adds native functions to the command handler.
   * @param parameters An array of functions to add as native commands.
   * @returns Returns the current instance of the command handler.
   */
  addNative(parameters: Function[]) {
    if (!Array.isArray(parameters)) {
      throw new AoijsError(
        "parameter",
        "the parameter should contain an array of functions",
      );
    }

    const allFuncs = parameters.every(
      (func) => typeof func === "function" && func.name !== "",
    );
    if (!allFuncs) {
      throw new AoijsError(
        "parameter",
        "the parameter should contain an array of functions",
      );
    }

    for (const func of parameters) {
      this.addFunction({
        name: `$${func.name}`,
        callback: async (context) => {
          if (context.isError) return;
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
   * @param parameters - Options for the function error command.
   * @param parameters.code - The code to be executed on function error.
   * @param parameters.useNative - The native functions to the command handler.
   */
  functionErrorCommand(parameters: { code: string; useNative?: Function[] }) {
    if (!parameters?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("functionError", async (context, event) => {
      event.telegram.functionError = false;
      this.evaluateCommand(
        { event: "functionError" },
        parameters.code,
        event,
        parameters.useNative,
      );
      event.telegram.functionError = true;
    });
    return this;
  }

  /**
   * Connect to the service and perform initialization tasks.
   */
  async connect() {
    const { autoUpdate = {}, extensions = [], logging } = this.parameters;

    if (autoUpdate.aoiWarning) {
      await this.warningManager.checkUpdates();
    }
    this.registerCommand.handler();
    this.registerAction.handler();
    this.registerTimeout.handler();
    this.registerAwaited.handler();

    if (extensions.length > 0) {
      for (let i = 0; i < extensions.length; i++) {
        const initPlugins = extensions[i];
        try {
          await initPlugins["initPlugins"](this);
          AoiLogger.info(
            `Plugin "${initPlugins.name}" has been dreadfully registered`,
          );
        } catch (err) {
          console.error(err);
        }
      }
    }

    if (logging === undefined || logging) {
      this.on("ready", aoiStart);
    }
    super.login();
  }
}

export { AoiClient, DatabaseOptions };
