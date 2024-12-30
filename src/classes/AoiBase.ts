import path from "node:path";
import { version } from "../index";
import type { RequestInit } from "node-fetch";
import { Interpreter, Compiler } from "./core/";
import type { Update } from "@telegram.ts/types";
import type { AoiFunction } from "./AoiFunction";
import { AoijsError, AoijsTypeError } from "./AoiError";
import { Logger, getObjectKey } from "@aoitelegram/util";
import { CustomFunctionManager } from "./CustomFunctionManager";
import { TelegramBot, Collection, type Context } from "telegramsjs";
import type {
  DataFunction,
  MaybeArray,
  CustomJSFunction,
  ContextEvent,
  CommandData,
  EventHandlers,
} from "./AoiTyping";

class AoiBase extends TelegramBot {
  public customFunction: CustomFunctionManager;
  public readonly events: Collection<string, { [key: string]: any }[]> =
    new Collection();
  public readonly availableFunctions: Collection<string, CustomJSFunction> =
    new Collection();
  public readonly availableCollectEvents = [
    "callbackQuery",
    "editedMessage",
    "myChatMember",
    "shippingQuery",
    "channelPost",
    "inlineQuery",
    "poll",
    "chatBoost",
    "loop",
    "pollAnswer",
    "chatJoinRequest",
    "message",
    "preCheckoutQuery",
    "chatMember",
    "messageReaction",
    "rateLimit",
    "ready",
    "editedChannelPost",
    "businessConnection",
    "businessMessage",
    "editedBusinessMessage",
    "deletedBusinessMessages",
    "messageReactionCount",
    "removedChatBoost",
    "functionError",
  ];
  #registerCollectEvent: Set<string> = new Set();

  constructor(token: string, requestOptions?: RequestInit) {
    if (!token) {
      throw new AoijsError(
        "You did not specify the 'token' parameter",
        "AoiBase",
      );
    }
    super(token, requestOptions);

    this.customFunction = new CustomFunctionManager(
      this,
      this.availableFunctions,
    );
  }

  on(event: string, listener: (...args: any[]) => void): this;

  on<T extends keyof EventHandlers>(event: T, listener: EventHandlers[T]): this;

  on(event: string, listener: (...data: any[]) => void) {
    super.on(event, listener);
    return this;
  }

  async evaluateCommand(command: any, eventData: any) {
    try {
      const complited = new Compiler({
        code: command.code,
        searchFailed: command.searchFailed,
        reverseFunctions: command.reverseReading,
        availableFunctions: this.availableFunctions,
      });

      const interpreter = new Interpreter(
        Object.assign({}, command, complited.compile()),
        eventData,
      );
      return await interpreter.runInput();
    } catch (err) {
      Logger.error(`${err}`);
    }
  }

  addEvent(
    events: `on${Capitalize<(typeof this.availableCollectEvents)[number]>}`[],
  ): AoiBase {
    for (const event of Array.from(new Set(events))) {
      const normalizedEventName =
        event.charAt(2).toLowerCase() + event.slice(3);
      const eventIndex =
        this.availableCollectEvents.indexOf(normalizedEventName);

      if (eventIndex === -1) {
        throw new AoijsTypeError(`Invalid event name "${event}"`);
      } else this.#registerCollectEvent.add(normalizedEventName);

      if (normalizedEventName === "ready" || normalizedEventName === "loop") {
        continue;
      }

      if (normalizedEventName === "message") {
        const {
          default: commandHandlers,
        } = require("./handlers/command/Command");
        commandHandlers(this);
        continue;
      }

      if (normalizedEventName === "callbackQuery") {
        const {
          default: actionHandlers,
        } = require("./handlers/command/Action");
        actionHandlers(this);
        continue;
      }

      if (normalizedEventName === "functionError") {
        const {
          default: functionErrorHandlers,
        } = require("./handlers/custom/FunctionError");
        functionErrorHandlers(this);
        continue;
      }

      const { default: eventHandler } = require(
        path.join(__dirname, "/handlers", normalizedEventName),
      );

      eventHandler(this);
    }
    return this;
  }

  loopCommand(
    options: CommandData<{ every?: number; executeOnStartup?: boolean }>,
  ): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("loop", options);
    return this;
  }

  readyCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("ready", options);
    return this;
  }

  rateLimitCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("rateLimit", options);
    return this;
  }

  messageCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("message", options);
    return this;
  }

  callbackQueryCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("callbackQuery", options);
    return this;
  }

  messageReactionCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("messageReaction", options);
    return this;
  }

  messageReactionCountCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("messageReactionCount", options);
    return this;
  }

  editedMessageCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("editedMessage", options);
    return this;
  }

  channelPostCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("channelPost", options);
    return this;
  }

  editedChannelPostCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("editedChannelPost", options);
    return this;
  }

  businessConnectionCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("businessConnection", options);
    return this;
  }

  businessMessageCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("businessMessage", options);
    return this;
  }

  editedBusinessMessageCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("editedBusinessMessage", options);
    return this;
  }

  deletedBusinessMessagesCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("deletedBusinessMessages", options);
    return this;
  }

  inlineQueryCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("inlineQuery", options);
    return this;
  }

  shippingQueryCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("shippingQuery", options);
    return this;
  }

  preCheckoutQueryCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("preCheckoutQuery", options);
    return this;
  }

  pollCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("poll", options);
    return this;
  }

  pollAnswerCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("pollAnswer", options);
    return this;
  }

  chatMemberCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("chatMember", options);
    return this;
  }

  myChatMemberCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("myChatMember", options);
    return this;
  }

  chatJoinRequestCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("chatJoinRequest", options);
    return this;
  }

  chatBoostCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("chatBoost", options);
    return this;
  }

  removedChatBoostCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }
    this.#addEvents("removedChatBoost", options);
    return this;
  }

  functionErrorCommand(options: CommandData): AoiBase {
    if (!options?.code) {
      throw new AoijsError("You did not specify the 'code' parameter");
    }

    this.#addEvents("functionError", options);
    return this;
  }

  createCustomFunction(
    dataFunction: MaybeArray<DataFunction | AoiFunction>,
  ): AoiBase {
    this.customFunction.createCustomFunction(dataFunction);
    return this;
  }

  ensureCustomFunction(
    dataFunction: MaybeArray<DataFunction | AoiFunction>,
  ): AoiBase {
    this.customFunction.ensureCustomFunction(dataFunction);
    return this;
  }

  removeFunction(functionName: string | string[]): boolean {
    return this.customFunction.removeFunction(functionName);
  }

  editCustomFunction(
    dataFunction: MaybeArray<DataFunction | AoiFunction>,
  ): boolean {
    return this.customFunction.editCustomFunction(dataFunction);
  }

  getCustomFunction(functionName: string): CustomJSFunction | undefined;
  getCustomFunction(functionName: string[]): (CustomJSFunction | undefined)[];
  getCustomFunction(functionName: string | string[]) {
    if (Array.isArray(functionName)) {
      return this.customFunction.getCustomFunction(functionName as string[]);
    } else {
      return this.customFunction.getCustomFunction(functionName as string);
    }
  }

  hasCustomFunction(functionName: string): boolean;
  hasCustomFunction(functionName: string[]): {
    name: string;
    result: boolean;
  }[];
  hasCustomFunction(functionName: string | string[]) {
    if (Array.isArray(functionName)) {
      return this.customFunction.hasCustomFunction(functionName as string[]);
    } else {
      return this.customFunction.hasCustomFunction(functionName as string);
    }
  }

  get countCustomFunction(): number {
    return this.customFunction.countCustomFunction;
  }

  #addEvents(
    type: (typeof this.availableCollectEvents)[number],
    command: { [key: string]: any },
  ): void {
    if (!this.availableCollectEvents.includes(type)) {
      throw new AoijsTypeError(
        `The specified type '${type}' does not exist for recording, here are all the available types: ${this.availableCollectEvents.join(", ")}`,
      );
    }

    if (!this.#registerCollectEvent.has(type)) {
      throw new AoijsTypeError(
        `This event "${type}" has not been registered, please use the <AoiClient>.addEvent method to register the event`,
      );
    }

    if (this.events.has(type)) {
      const eventsType = this.events.get(type);
      this.events.set(type, [...(eventsType || []), command]);
    } else this.events.set(type, [command]);
  }
}

export { AoiBase };
