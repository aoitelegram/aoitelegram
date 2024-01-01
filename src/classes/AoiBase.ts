import fs from "node:fs";
import path from "node:path";
import { Runtime } from "../Runtime";
import { AoiClient } from "./AoiClient";
import { Update } from "@telegram.ts/types";
import { getObjectKey } from "../function/parser";
import { TelegramBot, Context } from "telegramsjs";
import { LibDataFunction, DataFunction } from "./AoiTyping";
import { setInterval, clearInterval } from "node:timers";
import { CombinedEventFunctions } from "./AoiTyping";
import { AoiManager, DatabaseOptions } from "./AoiManager";
import { AoijsError, AoiStopping, MessageError } from "./AoiError";
import { version } from "../../package.json";

type AllowedUpdates = ReadonlyArray<Exclude<keyof Update, "update_id">>;

const defaultAllowedUpdates = [
  "message",
  "edited_message",
  "channel_post",
  "message_reaction",
  "message_reaction_count",
  "edited_channel_post",
  "inline_query",
  "chosen_inline_result",
  "callback_query",
  "shipping_query",
  "pre_checkout_query",
  "poll_answer",
  "poll",
  "chat_member",
  "my_chat_member",
  "chat_join_request",
  "chat_boost",
  "removed_chat_boost",
] as AllowedUpdates;

/**
 * Configuration options for interacting with the Telegram API.
 * @interface TelegramOptions
 */
interface TelegramOptions {
  /**
   * The maximum number of updates to fetch at once. Defaults to 100.
   * @type {number}
   */
  limit?: number;

  /**
   * The timeout for long polling in seconds. Defaults to 60 seconds.
   * @type {number}
   */
  timeout?: number;

  /**
   * An array of allowed update types to receive. Defaults to all updates.
   * @type {AllowedUpdates}
   */
  allowed_updates?: AllowedUpdates;

  /**
   * An optional session object for managing user sessions.
   * @type {unknown}
   */
  session?: unknown;
}

/**
 * A class that provides additional functionality for handling commands and messages.
 */
class AoiBase extends TelegramBot {
  #database: AoiManager;
  customFunction: DataFunction[] = [];
  functionsArray: LibDataFunction[] = [];
  varReplaceOption: boolean;
  /**
   * Creates a new instance of AoiBase.
   * @param  token - The token for authentication.
   * @param {TelegramOptions} telegram - Configuration options for the Telegram integration.
   * @param {DatabaseOptions} options.database - Options for the database.
   * @param {DataFunction[]} options.customFunction - An array of custom functions.
   * @param {string[]} options.disableFunctions - Functions that will be removed from the library's loading functions.
   * @param {boolean} options.varReplaceOption - Compilation of &localVar& variables.
   */
  constructor(
    token: string,
    telegram: TelegramOptions = {},
    database: DatabaseOptions = {},
    customFunction?: DataFunction[],
    disableFunctions?: string[],
    varReplaceOption?: boolean,
  ) {
    super(
      token,
      Array.isArray(telegram?.allowed_updates)
        ? telegram
        : { ...telegram, allowed_updates: defaultAllowedUpdates },
    );
    this.#database = new AoiManager(database);
    this.customFunction = customFunction || [];
    this.varReplaceOption = varReplaceOption || false;
    this.functionsArray = loadFunctionsLib(
      path.join(__dirname, "..", "/function/"),
      this.functionsArray,
      disableFunctions || [],
    );
  }

  /**
   * Register event listeners for the bot.
   * ```ts
   * bot.on("ready", client => {
   *  console.log(`Starting ${client.username}`);
   * });
   *
   * bot.on("message", message => {
   *  message.reply(`Hello ${message.first_name}`);
   * });
   * ```
   * @param event The event or an array of events to listen for.
   * @param listener The callback function to be executed when the event(s) occur.
   * @returns This instance of the bot for method chaining.
   */
  on<T extends keyof CombinedEventFunctions>(
    event: T,
    listener: CombinedEventFunctions[T],
  ): this;

  on(event: string, listener: (...data: any[]) => void) {
    super.on(event, listener);
    return this;
  }

  /**
   * Executes a block of code in response to a command.
   * @param command - The name of the command.
   * @param code - The code to be executed.
   * @param eventData - The context or user for executing the code.
   */
  async evaluateCommand(
    command: string | { event: string },
    code: string,
    eventData: unknown,
  ) {
    try {
      const runtime = new Runtime(
        eventData as Context & { telegram: AoiClient },
        this.#database,
        this.customFunction,
        this.varReplaceOption,
        this.functionsArray,
      );
      return await runtime.runInput(command, code);
    } catch (err) {
      if (!(err instanceof AoiStopping)) throw err;
    }
  }

  /**
   * Add a data function or an array of data functions to the customFunction options.
   * @param options - The data function(s) to add.
   */
  addFunction(options: DataFunction | DataFunction[]) {
    if (Array.isArray(options)) {
      for (const optionVersion of options) {
        if (!optionVersion?.name) {
          throw new AoijsError(
            "customFunction",
            "you did not specify the 'name' parameter",
          );
        }
        if ((optionVersion?.version ?? 0) > version) {
          throw new AoijsError(
            "customFunction",
            `to load this function ${optionVersion?.name}, the library version must be equal to or greater than ${
              optionVersion?.version ?? 0
            }`,
          );
        }
      }
      this.customFunction = [...(this.customFunction ?? []), ...options];
    } else {
      if (!options?.name) {
        throw new AoijsError(
          "customFunction",
          "you did not specify the 'name' parameter",
        );
      }
      if ((options?.version ?? 0) > version) {
        throw new AoijsError(
          "customFunction",
          `to load this function ${
            options.name
          }, the library version must be equal to or greater than ${
            options?.version ?? 0
          }`,
        );
      }
      this.customFunction = [...(this.customFunction ?? []), options];
    }
    return this;
  }

  /**
   * Removes function(s) from the customFunction array based on provided options.
   * @param options - The name of the function to remove or an array of function names.
   */
  removeFunction(options: string | string[]) {
    if (!this.customFunction) return false;
    if (Array.isArray(options)) {
      for (const name of options) {
        this.customFunction = this.customFunction.filter(
          (func) => func.name !== name,
        );
      }
    } else {
      this.customFunction = this.customFunction.filter(
        (func) => func.name !== options,
      );
    }
    return true;
  }

  /**
   * Executes a command in a loop at a specified interval.
   * @param options - Loop configuration options.
   * @param options.every - Interval in milliseconds for executing the code.
   * @param options.code - The command code to be executed in the loop.
   */
  loopCommand(options: { every?: number; code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    const intervalId = setInterval(async () => {
      this.addFunction({
        name: "$break",
        callback: () => clearInterval(intervalId),
      });
      await this.evaluateCommand({ event: "loop" }, options.code, this);
      this.removeFunction("$break");
    }, options.every ?? 60000);
    return this;
  }

  /**
   * Registers a code block to be executed when the bot is ready.
   * @param options - Command options.
   * @param options.code - The code to be executed when the bot is ready.
   */
  readyCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("ready", async (ctx) => {
      await this.evaluateCommand({ event: "ready" }, options.code, {
        ...ctx,
        telegram: this,
      });
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to a message.
   * @param options - Command options.
   * @param options.code - The code to be executed when a message is received.
   */
  messageCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("message", async (ctx) => {
      await this.evaluateCommand({ event: "message" }, options.code, ctx);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to a callback_query.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when a callback_query is received.
   */
  callbackQueryCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("callback_query", async (ctx) => {
      await this.evaluateCommand(
        { event: "callback_query" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to a message_reaction.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when a message_reaction is received.
   */
  messageReactionCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("message_reaction", async (ctx) => {
      await this.evaluateCommand(
        { event: "message_reaction" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to a message_reaction_count.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when a message_reaction_count is received.
   */
  messageReactionCountCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("message_reaction_count", async (ctx) => {
      await this.evaluateCommand(
        { event: "message_reaction_count" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an edited_message event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an edited_message event is received.
   */
  editedMessageCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("edited_message", async (ctx) => {
      await this.evaluateCommand(
        { event: "edited_message" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an channel_post event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an channel_post event is received.
   */
  channelPostCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("channel_post", async (ctx) => {
      await this.evaluateCommand({ event: "channel_post" }, options.code, ctx);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an edited_channel_post event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an edited_channel_post event is received.
   */
  editedChannelPostCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("edited_channel_post", async (ctx) => {
      await this.evaluateCommand(
        { event: "edited_channel_post" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an inline_query event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an inline_query event is received.
   */
  inlineQueryCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("inline_query", async (ctx) => {
      await this.evaluateCommand({ event: "inline_query" }, options.code, ctx);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an shipping_query event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an shipping_query event is received.
   */
  shippingQueryCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("shipping_query", async (ctx) => {
      await this.evaluateCommand(
        { event: "shipping_query" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an pre_checkout_query event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an pre_checkout_query event is received.
   */
  preCheckoutQueryCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("pre_checkout_query", async (ctx) => {
      await this.evaluateCommand(
        { event: "pre_checkout_query" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an poll event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an poll event is received.
   */
  pollCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("poll", async (ctx) => {
      await this.evaluateCommand({ event: "poll" }, options.code, ctx);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an poll_answer event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an poll_answer event is received.
   */
  pollAnswerCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("poll_answer", async (ctx) => {
      await this.evaluateCommand({ event: "poll_answer" }, options.code, ctx);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an chat_member event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an chat_member event is received.
   */
  chatMemberCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("chat_member", async (ctx) => {
      await this.evaluateCommand({ event: "chat_member" }, options.code, ctx);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an my_chat_member event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an my_chat_member event is received.
   */
  myChatMemberCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("my_chat_member", async (ctx) => {
      await this.evaluateCommand(
        { event: "my_chat_member" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an chat_join_request event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an chat_join_request event is received.
   */
  chatJoinRequestCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("chat_join_request", async (ctx) => {
      await this.evaluateCommand(
        { event: "chat_join_request" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to a chat_boost.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when a chat_boost is received.
   */
  chatBoostCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("chat_boost", async (ctx) => {
      await this.evaluateCommand({ event: "chat_boost" }, options.code, ctx);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to a removed_chat_boost.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when a removed_chat_boost is received.
   */
  removedChatBoostCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("removed_chat_boost", async (ctx) => {
      await this.evaluateCommand(
        { event: "removed_chat_boost" },
        options.code,
        ctx,
      );
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an variables create event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an create event is received.
   */
  variableCreateCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.#database.on("create", async (newVariable) => {
      this.addFunction({
        name: "$newVariable",
        callback: async (context, eventData, database, error) => {
          const [path = "value"] = await context.getEvaluateArgs();
          context.checkArgumentTypes([path], error, ["string"]);
          const result = getObjectKey(newVariable, path as string);
          return result;
        },
      });
      await this.evaluateCommand({ event: "variableCreate" }, options.code, {
        newVariable,
        telegram: this,
      });
      this.removeFunction(["$newVariable"]);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an variables updated event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an updated event is received.
   */
  variableUpdateCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.#database.on("update", async (newVariable, oldVariable) => {
      this.addFunction([
        {
          name: "$newVariable",
          callback: async (context, eventData, database, error) => {
            const [path = "value"] = await context.getEvaluateArgs();
            context.checkArgumentTypes([path], error, ["string"]);
            const result = getObjectKey(newVariable, path as string);
            return result;
          },
        },
        {
          name: "$oldVariable",
          callback: async (context, eventData, database, error) => {
            const [path = "value"] = await context.getEvaluateArgs();
            context.checkArgumentTypes([path], error, ["string"]);
            const result = getObjectKey(oldVariable, path as string);
            return result;
          },
        },
      ]);
      await this.evaluateCommand({ event: "variableUpdate" }, options.code, {
        newVariable,
        oldVariable,
        telegram: this,
      });
      this.removeFunction(["$newVariable", "$oldVariable"]);
    });
    return this;
  }

  /**
   * Registers a code block to be executed in response to an variables delete event.
   * @param  options - Command options.
   * @param  options.code - The code to be executed when an delete event is received.
   */
  variableDeleteCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.#database.on("delete", async (oldVariable) => {
      this.addFunction({
        name: "$oldVariable",
        callback: async (context, eventData, database, error) => {
          const [path = "value"] = await context.getEvaluateArgs();
          context.checkArgumentTypes([path], error, ["string"]);
          const result = getObjectKey(oldVariable, path as string);
          return result;
        },
      });
      await this.evaluateCommand({ event: "variableDelete" }, options.code, {
        oldVariable,
        telegram: this,
      });
      this.removeFunction("$oldVariable");
    });
    return this;
  }

  /**
   * Set variables in the database.
   * @param  options - Key-value pairs of variables to set.
   * @param {string | string[]} table - The database table to use (optional).
   */
  variables(options: { [key: string]: unknown }, table?: string | string[]) {
    this.#database.variables(options, table);
  }
}

/**
 * Reads and processes JavaScript files containing functions from a specified directory.
 *
 * @param  dirPath - The path to the directory containing JavaScript files.
 * @param functionsArray - An array to store processed data functions.
 * @param disableFunctions - An array of function names to be disabled.
 */
function loadFunctionsLib(
  dirPath: string,
  functionsArray: LibDataFunction[],
  disableFunctions: string[],
) {
  const disableFunctionsSet = new Set(
    disableFunctions.map((func) => func.toLowerCase()),
  );

  const processFile = (itemPath: string) => {
    const dataFunction = require(itemPath).default;
    if (!dataFunction?.name && typeof !dataFunction?.callback !== "function")
      return;
    const dataFunctionName = dataFunction.name.toLowerCase();
    if (disableFunctionsSet.has(dataFunctionName)) return;

    functionsArray.push(dataFunction);
  };

  const processItem = (item: string) => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      loadFunctionsLib(itemPath, functionsArray, disableFunctions);
    } else if (itemPath.endsWith(".js")) {
      processFile(itemPath);
    }
  };

  const items = fs.readdirSync(dirPath);
  items.forEach(processItem);
  return functionsArray;
}

export { AoiBase, TelegramOptions };
