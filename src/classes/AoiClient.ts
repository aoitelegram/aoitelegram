import chalk from "chalk";
import path from "node:path";
import fs from "node:fs/promises";
import { AoiLogger } from "./AoiLogger";
import aoiStart from "../utils/AoiStart";
import { CustomEvent } from "./CustomEvent";
import type { RequestInit } from "node-fetch";
import { AoiExtension } from "./AoiExtension";
import type { DataFunction } from "./AoiTyping";
import type { ILoginOptions } from "telegramsjs";
import type { LoadCommands } from "./LoadCommands";
import { Collection } from "@telegram.ts/collection";
import type { AoiManagerOptions } from "./AoiManager";
import { AoijsError, AoijsTypeError } from "./AoiError";
import { AoiBase, type IEventsOptions } from "./AoiBase";
import { Timeout, TimeoutDescription } from "../helpers/Timeout";
import { Awaited, AwaitedDescription } from "../helpers/Awaited";
import { AoiWarning, type AoiWarningOptions } from "./AoiWarning";
import type { IActionDescription } from "./handlers/command/Action";
import type { ICommandDescription } from "./handlers/command/Command";
import { Callback, CallbackDescription } from "../helpers/Callback";
import { TimeoutManager } from "../helpers/manager/TimeoutManager";
import { AwaitedManager } from "../helpers/manager/AwaitedManager";

class AoiClient extends AoiBase {
  public customEvent?: CustomEvent;
  public warningManager: AoiWarning;
  public loadCommands?: LoadCommands;
  public timeoutManager: TimeoutManager;
  public awaitedManager: AwaitedManager;
  public functionError?: boolean = false;
  public sendMessageError?: boolean = true;
  public readonly registerAwaited: Awaited = new Awaited(this);
  public readonly registerTimeout: Timeout = new Timeout(this);
  public readonly registerCallback: Callback = new Callback(this);
  public readonly commands: Collection<
    string,
    (ICommandDescription | IActionDescription)[]
  > = new Collection();
  public readonly globalVars: Collection<string, unknown> = new Collection();

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

    const allAoiExtends = parameters.extensions?.every?.(
      (cls) => cls instanceof AoiExtension,
    );

    if (!allAoiExtends && Array.isArray(parameters.extensions)) {
      throw new AoijsTypeError(
        "In the parameter 'extensions', all classes should be inherited from the class 'AoiExtension'",
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

  addCommand(options: ICommandDescription): AoiClient {
    if (!options?.name) {
      throw new AoijsError("You did not specify the 'name' parameter");
    }
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    if (this.commands.has("command")) {
      const commandsType = this.commands.get("command");
      this.commands.set("command", [...(commandsType || []), options]);
    } else this.commands.set("command", [options]);
    return this;
  }

  addAction(options: IActionDescription): AoiClient {
    if (!options?.data) {
      throw new AoijsError("You did not specify the 'data' parameter");
    }
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    if (this.commands.has("action")) {
      const actionType = this.commands.get("action");
      this.commands.set("action", [...(actionType || []), options]);
    } else this.commands.set("action", [options]);
    return this;
  }

  timeoutCommand(options: TimeoutDescription): AoiClient {
    if (!options?.id) {
      throw new AoijsError("You did not specify the 'id' parameter");
    }
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.registerTimeout.register(options);
    return this;
  }

  awaitedCommand(options: AwaitedDescription): AoiClient {
    if (!options?.awaited) {
      throw new AoijsError("You did not specify the 'awaited' parameter");
    }
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.registerAwaited.register(options);
    return this;
  }

  addCallback(options: CallbackDescription): AoiClient {
    if (!options?.name) {
      throw new AoijsError("You did not specify the 'name' parameter.");
    }

    if (options.type === "aoitelegram" && !options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter.");
    }

    if (options.type === "js" && !options?.callback) {
      throw new AoijsError("You did not specify the 'callback' parameter.");
    }

    this.registerCallback.register(options);
    return this;
  }

  functionErrorCommand(options: IEventsOptions): AoiClient {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.on("functionError", async (context, telegram) => {
      telegram.functionError = false;
      this.evaluateCommand(options, context);
      telegram.functionError = true;
    });
    return this;
  }

  async connect(options?: ILoginOptions): Promise<void> {
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
            `Plugin '${initPlugins.name}' has been dreadfully registered`,
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

  async #loadFunctionsLib(dirPath: string): Promise<void> {
    const items = await fs.readdir(dirPath, {
      recursive: true,
    });

    for (const itemPath of items) {
      if (!itemPath.endsWith(".js")) continue;
      const { default: dataFunction } = (
        await import(path.join(__dirname, `../function/${itemPath}`))
      ).default;

      if (
        !dataFunction ||
        typeof dataFunction.name !== "string" ||
        typeof dataFunction.callback !== "function"
      ) {
        continue;
      }

      const dataFunctionName = dataFunction.name.toLowerCase();
      if (
        this.parameters.disableFunctions?.find(
          (name) => name === dataFunctionName,
        )
      ) {
        continue;
      }

      this.availableFunctions.set(dataFunctionName, dataFunction);
    }
  }
}

export { AoiClient };
