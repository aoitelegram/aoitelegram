import { version } from "../index";
import { AoiClient } from "./AoiClient";
import { getObjectKey } from "../utils/";
import { Update } from "@telegram.ts/types";
import type { RequestInit } from "node-fetch";
import { Interpreter, Compiler } from "./core/";
import { AoijsError, AoijsTypeError } from "./AoiError";
import { ContextEvent, EventHandlers } from "./AoiTyping";
import { AoiManager, type AoiManagerOptions } from "./AoiManager";
import type { DataFunction, CustomJSFunction } from "./AoiTyping";
import { TelegramBot, Collection, type Context } from "telegramsjs";

interface IEventsOptions {
  name: string;
  every?: number;
  description?: string;
  reverseReading?: boolean;
  chatId?: number | string;
  code: string;
}

class AoiBase extends TelegramBot {
  database: AoiManager = {} as AoiManager;
  events: Collection<string, IEventsOptions[]> = new Collection();
  availableFunctions: Collection<string, CustomJSFunction> = new Collection();
  availableCollectFunctions = [
    "callbackQuery",
    "editedMessage",
    "myChatMember",
    "shippingQuery",
    "channelPost",
    "inlineQuery",
    "poll",
    "variableCreate",
    "chatBoost",
    "loop",
    "pollAnswer",
    "variableDelete",
    "chatJoinRequest",
    "message",
    "preCheckoutQuery",
    "variableUpdate",
    "chatMember",
    "messageReaction",
    "ready",
    "editedChannelPost",
    "businessConnection",
    "businessMessage",
    "editedBusinessMessage",
    "deletedBusinessMessages",
    "messageReactionCount",
    "removedChatBoost",
  ];

  constructor(
    token: string,
    requestOptions?: RequestInit,
    database?: AoiManagerOptions,
    disableAoiDB?: boolean,
  ) {
    if (!token) {
      throw new AoijsError(
        "AoiBase",
        "You did not specify the 'token' parameter",
      );
    }
    super(token, requestOptions);

    if (!disableAoiDB) {
      this.database = new AoiManager(database);
    }
  }

  on(event: string, listener: (...args: any[]) => void): this;

  on<T extends keyof EventHandlers>(event: T, listener: EventHandlers[T]): this;

  on(event: string, listener: (...data: any[]) => void) {
    super.on(event, listener);
    return this;
  }

  async evaluateCommand(command: Record<string, any>, eventData: any) {
    try {
      const complited = new Compiler({
        code: command.code,
        reverseFunctions: command.reverseReading,
        availableFunctions: this.availableFunctions,
      });
      const interpreter = new Interpreter(
        Object.assign(complited.compile(), command),
        eventData,
      );
      return await interpreter.runInput();
    } catch (err) {
      console.log(err);
    }
  }

  createCustomFunction(dataFunction: DataFunction | DataFunction[]) {
    const arrayDataFunction = Array.isArray(dataFunction)
      ? dataFunction
      : [dataFunction];
    for (const func of arrayDataFunction) {
      const functionName = func?.name?.toLowerCase();
      if (!functionName) {
        throw new AoijsError(
          "customFunction",
          "you did not specify the 'name' parameter",
        );
      }

      if (this.availableFunctions.has(functionName)) {
        throw new AoijsError(
          "customFunction",
          `the function "${functionName}" already exists; to overwrite it, use the <AoiClient>.editFunction method!`,
        );
      }

      if ((func?.version || 0) > version) {
        throw new AoijsError(
          "customFunction",
          `to load this function ${functionName}, the library version must be equal to or greater than ${func?.version || 0}`,
        );
      }
      if (func.type === "aoitelegram") {
        this.availableFunctions.set(functionName, {
          name: functionName,
          version: func.version,
          aliases: func.aliases,
          brackets: func.params?.length! > 0,
          fields: func.params?.map((name) => {
            return {
              name: name.replace("?", "").replace("...", ""),
              required: !name.endsWith("?"),
              rest: name.startsWith("..."),
            };
          }),
          callback: async (ctx, fun) => {
            const result = await this.evaluateCommand(
              {
                name: func.name,
                reverseReading: func.reverseReading,
                code: func.code,
              },
              ctx.eventData,
            );
            return fun.resolve(result);
          },
        });
      } else
        this.availableFunctions.set(
          functionName,
          func as unknown as CustomJSFunction,
        );
    }
    return this;
  }

  ensureCustomFunction(dataFunction: DataFunction | DataFunction[]) {
    const arrayDataFunction = Array.isArray(dataFunction)
      ? dataFunction
      : [dataFunction];
    for (const func of arrayDataFunction) {
      const functionName = func?.name?.toLowerCase();
      if (!functionName) {
        throw new AoijsError(
          "customFunction",
          "you did not specify the 'name' parameter",
        );
      }

      if ((func?.version || 0) > version) {
        throw new AoijsError(
          "customFunction",
          `to load this function ${functionName}, the library version must be equal to or greater than ${func?.version || 0}`,
        );
      }

      if (func.type === "aoitelegram") {
        this.availableFunctions.set(functionName, {
          name: functionName,
          version: func.version,
          aliases: func.aliases,
          brackets: func.params?.length! > 0,
          fields: func.params?.map((name) => {
            return {
              name: name.replace("?", "").replace("...", ""),
              required: name.endsWith("?"),
              rest: name.startsWith("..."),
            };
          }),
          callback: async (ctx, fun) => {
            const result = await this.evaluateCommand(
              {
                name: func.name,
                reverseReading: func.reverseReading,
                code: func.code,
              },
              ctx.eventData,
            );
            return fun.resolve(result);
          },
        });
      } else
        this.availableFunctions.set(
          functionName,
          func as unknown as CustomJSFunction,
        );
    }
    return this;
  }

  removeFunction(functionName: string | string[]): boolean {
    const functionNames = Array.isArray(functionName)
      ? functionName
      : [functionName];

    if (functionNames.length < 1) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'name' parameter",
      );
    }

    for (const name of functionNames) {
      const lowerCaseName = name.toLowerCase();
      const hasDeleted = this.availableFunctions.delete(lowerCaseName);
      if (!hasDeleted) {
        throw new AoijsError(
          "customFunction",
          `the function "${lowerCaseName}" does not exist or has already been deleted`,
        );
      }
    }
    return true;
  }

  editCustomFunction(dataFunction: DataFunction | DataFunction[]) {
    const functionsToEdit = Array.isArray(dataFunction)
      ? dataFunction
      : [dataFunction];

    if (!functionsToEdit.length) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'name' parameter",
      );
    }

    for (const func of functionsToEdit) {
      const lowerCaseName = func?.name?.toLowerCase();
      if (!this.availableFunctions.has(lowerCaseName)) {
        throw new AoijsError(
          "customFunction",
          `the function "${lowerCaseName}" does not exist; you can only modify functions that have been added recently`,
        );
      }

      if (func.type === "aoitelegram") {
        this.availableFunctions.set(lowerCaseName, {
          name: lowerCaseName,
          version: func.version,
          aliases: func.aliases,
          brackets: func.params?.length! > 0,
          fields: func.params?.map((name) => {
            return {
              name: name.replace("?", "").replace("...", ""),
              required: name.endsWith("?"),
              rest: name.startsWith("..."),
            };
          }),
          callback: async (ctx, fun) => {
            const result = await this.evaluateCommand(
              {
                name: func.name,
                reverseReading: func.reverseReading,
                code: func.code,
              },
              ctx.eventData,
            );
            return fun.resolve(result);
          },
        });
      } else
        this.availableFunctions.set(
          lowerCaseName,
          func as unknown as CustomJSFunction,
        );
    }

    return true;
  }

  getCustomFunction(functionName: string): CustomJSFunction | undefined;
  getCustomFunction(functionName: string[]): (CustomJSFunction | undefined)[];
  getCustomFunction(functionName: string | string[]) {
    const functionNames = Array.isArray(functionName)
      ? functionName
      : [functionName];

    if (functionNames.length < 1) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'name' parameter",
      );
    }

    if (functionNames.length > 1) {
      return functionNames.map((name) => this.availableFunctions.get(name));
    } else {
      return this.availableFunctions.get(functionNames[0]);
    }
  }

  hasCustomFunction(functionName: string): boolean;
  hasCustomFunction(
    functionName: string[],
  ): { name: string; result: boolean }[];
  hasCustomFunction(functionName: string | string[]) {
    if (Array.isArray(functionName)) {
      return functionName.map((fun) => ({
        name: fun,
        result: this.availableFunctions.has(fun),
      }));
    } else if (typeof functionName === "string") {
      return this.availableFunctions.has(functionName) as boolean;
    } else {
      throw new AoijsError(
        "customFunction",
        `the specified type should be "string | string[]"`,
      );
    }
  }

  get countCustomFunction() {
    return this.availableFunctions.size;
  }

  loopCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("loop", options);
    return this;
  }

  readyCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("ready", options);
    return this;
  }

  messageCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("message", options);
    return this;
  }

  callbackQueryCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("callbackQuery", options);
    return this;
  }

  messageReactionCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("messageReaction", options);
    return this;
  }

  messageReactionCountCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("messageReactionCount", options);
    return this;
  }

  editedMessageCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("editedMessage", options);
    return this;
  }

  channelPostCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("channelPost", options);
    return this;
  }

  editedChannelPostCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("editedChannelPost", options);
    return this;
  }

  businessConnectionCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("businessConnection", options);
    return this;
  }

  businessMessageCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("businessMessage", options);
    return this;
  }

  editedBusinessMessageCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("editedBusinessMessage", options);
    return this;
  }

  deletedBusinessMessagesCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("deletedBusinessMessages", options);
    return this;
  }

  inlineQueryCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("inlineQuery", options);
    return this;
  }

  shippingQueryCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("shippingQuery", options);
    return this;
  }

  preCheckoutQueryCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("preCheckoutQuery", options);
    return this;
  }

  pollCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("poll", options);
    return this;
  }

  pollAnswerCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("pollAnswer", options);
    return this;
  }

  chatMemberCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("chatMember", options);
    return this;
  }

  myChatMemberCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("myChatMember", options);
    return this;
  }

  chatJoinRequestCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("chatJoinRequest", options);
    return this;
  }

  chatBoostCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("chatBoost", options);
    return this;
  }

  removedChatBoostCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("removedChatBoost", options);
    return this;
  }

  variableCreateCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("variableCreate", options);
    return this;
  }

  variableUpdateCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("variableUpdate", options);
    return this;
  }

  variableDeleteCommand(options: IEventsOptions): AoiBase {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'options.code' parameter",
      );
    }
    this.#addEvents("variableDelete", options);
    return this;
  }

  #addEvents(
    type:
      | "callbackQuery"
      | "editedMessage"
      | "myChatMember"
      | "shippingQuery"
      | "channelPost"
      | "inlineQuery"
      | "poll"
      | "variableCreate"
      | "chatBoost"
      | "loop"
      | "pollAnswer"
      | "variableDelete"
      | "chatJoinRequest"
      | "message"
      | "preCheckoutQuery"
      | "variableUpdate"
      | "chatMember"
      | "messageReaction"
      | "ready"
      | "editedChannelPost"
      | "businessConnection"
      | "businessMessage"
      | "editedBusinessMessage"
      | "deletedBusinessMessages"
      | "messageReactionCount"
      | "removedChatBoost",
    command: IEventsOptions,
  ): void {
    if (!this.availableCollectFunctions.includes(type)) {
      throw new AoijsTypeError(
        `The specified type ${type} does not exist for recording, here are all the available types: ${this.availableCollectFunctions.join(", ")}`,
      );
    }
    if (this.events.has(type)) {
      const eventsType = this.events.get(type);
      this.events.set(type, [...(eventsType || []), command]);
    } else this.events.set(type, [command]);
  }

  async variables(
    options: { [key: string]: any },
    tables?: string | string[],
  ): Promise<AoiBase> {
    if (!("variables" in this.database)) {
      throw new AoijsTypeError(
        'No method named "variables" was found in the database class',
      );
    }
    await this.database.variables(options, tables);
    return this;
  }
}

export { AoiBase, IEventsOptions };
