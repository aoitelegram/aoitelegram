import { TelegramBot, type Context } from "telegramsjs";
import { UserFromGetMe, Update } from "@telegram.ts/types";
import { AoijsError, AoiStopping, MessageError } from "./AoiError";
import { AoiManager, DatabaseOptions } from "./AoiManager";
import { Runtime } from "../Runtime";
import { version } from "../../package.json";

type AllowedUpdates = ReadonlyArray<Exclude<keyof Update, "update_id">>;

type DataFunction =
  | {
      name: string;
      type: "aoitelegram";
      version?: string;
      params?: string[];
      code: string;
    }
  | {
      name: string;
      type?: "js";
      version?: string;
      callback: (
        ctx: Context,
        event: TelegramBot & Context,
        database: AoiManager,
        error: MessageError,
      ) => unknown;
    };

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
  plugin?: DataFunction[];
  /**
   * Creates a new instance of AoiBase.
   * @param {string} token - The token for authentication.
   * @param {TelegramOptions} telegram - Configuration options for the Telegram integration.
   * @param {DatabaseOptions} options.database - Options for the database.
   */
  constructor(
    token: string,
    telegram?: TelegramOptions,
    database?: DatabaseOptions,
    plugin?: DataFunction[],
  ) {
    super(token, telegram);
    this.#database = new AoiManager(database);
    this.plugin = plugin;
    this.setMaxListeners(Infinity);
  }

  /**
   * Executes a block of code in response to a command.
   * @param {string | {event: string}} command - The name of the command.
   * @param {string} code - The code to be executed.
   * @param {(TelegramBot & Context) | UserFromGetMe} telegram - The context or user for executing the code.
   */
  async evaluateCommand(
    command: string | { event: string },
    code: string,
    telegram: (TelegramBot & Context) | UserFromGetMe,
  ) {
    try {
      const runtime = new Runtime(telegram, this.#database, this.plugin);
      await runtime.runInput(command, code);
    } catch (err) {
      if (!(err instanceof AoiStopping)) throw err;
    }
  }

  /**
   * Add a data function or an array of data functions to the plugin options.
   * @param {DataFunction|DataFunction[]} options - The data function(s) to add.
   * @returns {void}
   */
  addFunction(options: DataFunction | DataFunction[]) {
    if (Array.isArray(options)) {
      for (const optionVersion of options) {
        if (!optionVersion?.name) {
          throw new AoijsError(
            "aoiplugins",
            "you did not specify the 'name' parameter",
          );
        }
        if ((optionVersion?.version ?? 0) > version) {
          throw new AoijsError(
            "aoiplugins",
            `to load this function ${optionVersion?.name}, the library version must be equal to or greater than ${
              optionVersion?.version ?? 0
            }`,
          );
        }
      }
      this.plugin = [...(this.plugin ?? []), ...options];
    } else {
      if (!options?.name) {
        throw new AoijsError(
          "aoiplugins",
          "you did not specify the 'name' parameter",
        );
      }
      if ((options?.version ?? 0) > version) {
        throw new AoijsError(
          "aoiplugins",
          `to load this function ${
            options.name
          }, the library version must be equal to or greater than ${
            options?.version ?? 0
          }`,
        );
      }
      this.plugin = [...(this.plugin ?? []), options];
    }
  }

  /**
   * Registers a code block to be executed when the bot is ready.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when the bot is ready.
   */
  readyCommand(options: { code: string }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("ready", async (ctx) => {
      await this.evaluateCommand({ event: "ready" }, options.code, ctx);
    });
  }

  /**
   * Registers a code block to be executed in response to a message.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when a message is received.
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
  }

  /**
   * Registers a code block to be executed in response to a callback_query.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when a callback_query is received.
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
  }

  /**
   * Registers a code block to be executed in response to an edited_message event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an edited_message event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an channel_post event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an channel_post event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an edited_channel_post event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an edited_channel_post event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an inline_query event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an inline_query event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an shipping_query event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an shipping_query event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an pre_checkout_query event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an pre_checkout_query event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an poll event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an poll event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an poll_answer event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an poll_answer event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an chat_member event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an chat_member event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an my_chat_member event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an my_chat_member event is received.
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
  }

  /**
   * Registers a code block to be executed in response to an chat_join_request event.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when an chat_join_request event is received.
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
  }

  /**
   * Set variables in the database.
   * @param {Object} options - Key-value pairs of variables to set.
   * @param {string | string[]} table - The database table to use (optional).
   */
  async variables(
    options: { [key: string]: unknown },
    table?: string | string[],
  ) {
    await this.#database.variables(options, table);
  }
}

export { AoiBase, DataFunction, TelegramOptions };
