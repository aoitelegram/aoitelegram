import fs from "node:fs";
import chalk from "chalk";
import path from "node:path";
import aoiStart from "../utils/AoiStart";
import { AoijsError } from "./AoiError";
import { AoiLogger } from "./AoiLogger";
import type { RequestInit } from "node-fetch";
import type { ILoginOptions } from "telegramsjs";
import { Collection } from "@telegram.ts/collection";
import { DataFunction } from "./AoiTyping";
import { CustomEvent } from "./CustomEvent";
import { AoiExtension } from "./AoiExtension";
import { LoadCommands } from "./LoadCommands";
import { AoiManagerOptions } from "./AoiManager";
import { AoiBase } from "./AoiBase";
import { AoiWarning, AoiWarningOptions } from "./AoiWarning";
import { Action, ActionDescription } from "../helpers/Action";
import { Callback, CallbackDescription } from "../helpers/Callback";
import { TimeoutManager } from "../helpers/manager/TimeoutManager";
import { AwaitedManager } from "../helpers/manager/AwaitedManager";
import { Command, CommandDescription } from "../helpers/Command";
import { Timeout, TimeoutDescription } from "../helpers/Timeout";
import { Awaited, AwaitedDescription } from "../helpers/Awaited";

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
  globalVars: Collection<string, unknown> = new Collection();

  constructor(
    public readonly token: string,
    public readonly parameters: {
      requestOptions?: RequestInit;
      database?: AoiManagerOptions;
      disableFunctions?: string[];
      native?: Function[];
      extensions?: AoiExtension[];
      functionError?: boolean;
      sendMessageError?: boolean;
      disableAoiDB?: boolean;
      logging?: boolean;
      autoUpdate?: AoiWarningOptions;
    } = {},
  ) {
    super(
      token,
      parameters.requestOptions,
      parameters.database,
      parameters.disableAoiDB,
    );

    const allAoiExtends = parameters.extensions?.every(
      (cls) => cls instanceof AoiExtension,
    );
    if (!allAoiExtends && Array.isArray(parameters.extensions)) {
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

  async connect(options?: ILoginOptions) {
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
          AoiLogger.error(err);
        }
      }
    }

    if (logging === undefined || logging) {
      this.on("ready", async (ctx) => {
        await this.#loadFunctionsLib(path.join(__dirname, "../function/"));
        (await import("./handlers/Ready"))(this);
        await aoiStart(ctx);
        this.emit("onStart", this);
      });
    }
    super.login();
  }

  async #loadFunctionsLib(dirPath: string) {
    const processFile = async (itemPath: string) => {
      try {
        const dataFunction = require(itemPath).default;
        if (
          !dataFunction ||
          typeof dataFunction.name !== "string" ||
          typeof dataFunction.callback !== "function"
        ) {
          return;
        }
        const dataFunctionName = dataFunction.name.toLowerCase();
        if (this.parameters.disableFunctions?.includes(dataFunctionName))
          return;

        this.availableFunctions.set(dataFunctionName, dataFunction);
      } catch (error) {
        console.error(error);
      }
    };

    const processItem = async (item: string) => {
      const itemPath = path.join(dirPath, item);
      try {
        const stats = await fs.promises.stat(itemPath);
        if (stats.isDirectory()) {
          await this.#loadFunctionsLib(itemPath);
        } else if (itemPath.endsWith(".js")) {
          await processFile(itemPath);
        }
      } catch (error) {
        console.error(error);
      }
    };

    try {
      const items = await fs.promises.readdir(dirPath);
      for (const item of items) {
        await processItem(item);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export { AoiClient };
