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
import { AoiBase, type IEventsOptions } from "./AoiBase";
import { AoiWarning, AoiWarningOptions } from "./AoiWarning";
import type { IActionDescription } from "./handlers/command/Action";
import type { ICommandDescription } from "./handlers/command/Command";
import { Callback, CallbackDescription } from "../helpers/Callback";
import { TimeoutManager } from "../helpers/manager/TimeoutManager";
import { AwaitedManager } from "../helpers/manager/AwaitedManager";
import { Timeout, TimeoutDescription } from "../helpers/Timeout";
import { Awaited, AwaitedDescription } from "../helpers/Awaited";

class AoiClient extends AoiBase {
  customEvent?: CustomEvent;
  warningManager: AoiWarning;
  loadCommands?: LoadCommands;
  timeoutManager: TimeoutManager;
  awaitedManager: AwaitedManager;
  functionError?: boolean = false;
  sendMessageError?: boolean = true;
  registerAwaited: Awaited = new Awaited(this);
  registerTimeout: Timeout = new Timeout(this);
  registerCallback: Callback = new Callback(this);
  commands: Collection<string, (ICommandDescription | IActionDescription)[]> =
    new Collection();
  globalVars: Collection<string, unknown> = new Collection();

  constructor(
    token: string,
    public readonly parameters: {
      requestOptions?: RequestInit;
      database?: AoiManagerOptions;
      disableFunctions?: string[];
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

    this.functionError = parameters.functionError;
    this.sendMessageError =
      typeof parameters.sendMessageError === "undefined"
        ? true
        : parameters.sendMessageError;
    this.timeoutManager = new TimeoutManager(this);
    this.awaitedManager = new AwaitedManager(this);
    this.warningManager = new AoiWarning(parameters.autoUpdate || {});
  }

  addCommand(options: ICommandDescription) {
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
    if (!this.commands.has("command")) {
      const commandsType = this.commands.get("command");
      this.commands.set("command", [...(commandsType || []), options]);
    } else this.commands.set("command", [options]);
    return this;
  }

  addAction(options: IActionDescription) {
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
    if (!this.commands.has("action")) {
      const actionType = this.commands.get("action");
      this.commands.set("action", [...(actionType || []), options]);
    } else this.commands.set("action", [options]);
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
    return this;
  }

  functionErrorCommand(options: IEventsOptions) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("functionError", async (context, telegram) => {
      telegram.functionError = false;
      this.evaluateCommand(options, context);
      telegram.functionError = true;
    });
    return this;
  }

  async connect(options?: ILoginOptions) {
    const { autoUpdate = {}, extensions = [], logging } = this.parameters;

    if (autoUpdate.aoiWarning) {
      await this.warningManager.checkUpdates();
    }
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
        await aoiStart(this);
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
      } catch (err) {
        console.error(err);
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
      } catch (err) {
        console.error(err);
      }
    };

    try {
      const items = await fs.promises.readdir(dirPath);
      for (const item of items) {
        await processItem(item);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export { AoiClient };
