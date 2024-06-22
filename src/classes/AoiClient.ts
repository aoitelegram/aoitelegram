import chalk from "chalk";
import path from "node:path";
import fs from "node:fs/promises";
import { AoiBase } from "./AoiBase";
import { AoiLogger } from "./AoiLogger";
import { AoiFunction } from "./AoiFunction";
import type { RequestInit } from "node-fetch";
import { AoiExtension } from "./AoiExtension";
import type { ILoginOptions } from "telegramsjs";
import aoiStart from "./handlers/custom/AoiStart";
import { Collection } from "@telegram.ts/collection";
import { AoijsError, AoijsTypeError } from "./AoiError";
import { AwaitedManager } from "../helpers/AwaitedManager";
import type { DataFunction, CommandData } from "./AoiTyping";
import { AoiWarning, type AoiWarningOptions } from "./AoiWarning";
import type { BotCommand, BotCommandScope } from "@telegram.ts/types";

class AoiClient extends AoiBase {
  public warningManager: AoiWarning;
  public awaitedManager: AwaitedManager;
  public functionError?: boolean = false;
  public sendMessageError?: boolean = true;
  public readonly commands: Collection<
    string,
    (
      | CommandData<{ data: string }>
      | CommandData<{
          command: string;
          description?: string;
          aliases?: string[];
        }>
    )[]
  > = new Collection();
  public readonly globalVars: Collection<string, unknown> = new Collection();

  constructor(
    token: string,
    public readonly parameters: {
      requestOptions?: RequestInit;
      disableFunctions?: string[];
      extensions?: AoiExtension[];
      functionError?: boolean;
      sendMessageError?: boolean;
      logging?: boolean;
      myCommands?: {
        register?: boolean;
        language_code?: string;
        scope?: BotCommandScope;
      };
      autoUpdate?: AoiWarningOptions;
    } = {},
  ) {
    super(token, parameters.requestOptions);

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
    this.awaitedManager = new AwaitedManager(this);
    this.warningManager = new AoiWarning(parameters.autoUpdate || {});
  }

  addCommand(
    options: CommandData<{
      command: string;
      description?: string;
      aliases?: string[];
    }>,
  ): AoiClient {
    if (!options?.command) {
      throw new AoijsError("You did not specify the 'command' parameter");
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

  addAction(options: CommandData<{ data: string }>): AoiClient {
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

  awaitedCommand(options: CommandData<{ name: string }>): AoiClient {
    if (!options?.name) {
      throw new AoijsError("You did not specify the 'name' parameter");
    }
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.awaitedManager.registerAwaited(options);
    return this;
  }

  async connect(options?: ILoginOptions): Promise<void> {
    const {
      autoUpdate = {},
      extensions = [],
      logging,
      myCommands = {},
    } = this.parameters;

    if (autoUpdate.aoiWarning) {
      await this.warningManager.checkUpdates();
    }
    await this.#loadFunctions();

    if (myCommands.register) {
      await this.setMyCommands({
        scope: myCommands.scope,
        language_code: myCommands.language_code,
        commands: (
          Object.values(this.commands.get("command") || {}).filter(
            (value) =>
              typeof value === "object" &&
              value !== null &&
              "command" in value &&
              "description" in value,
          ) as BotCommand[]
        ).map((cmd) => ({ ...cmd, command: `/${cmd.command}` })),
      });
    }

    this.awaitedManager.handleAwaited();

    if (extensions.length > 0) {
      for (let i = 0; i < extensions.length; i++) {
        const initPlugins = extensions[i];
        try {
          await initPlugins["initPlugins"](this);
          AoiLogger.info(
            `Plugin '${initPlugins.name}' has been dreadfully registered`,
          );
        } catch (err) {
          AoiLogger.error(`${err}`);
        }
      }
    }
    this.on("ready", async () => await aoiStart(this));
    super.login();
  }

  async #loadFunctions(): Promise<void> {
    const dirPath = path.join(__dirname, "../function/");
    const items = await fs.readdir(dirPath, {
      recursive: true,
    });

    for (const itemPath of items) {
      if (!itemPath.endsWith(".js")) continue;
      const { default: dataFunction } = require(`${dirPath}/${itemPath}`);

      if (!dataFunction || !(dataFunction instanceof AoiFunction)) {
        continue;
      }

      const dataFunctionName = dataFunction.name.toLowerCase();
      if (this.parameters.disableFunctions?.indexOf(dataFunctionName) === -1) {
        continue;
      }

      this.createCustomFunction(dataFunction);
    }
  }
}

export { AoiClient };
