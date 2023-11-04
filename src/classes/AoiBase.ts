import { TelegramBot, type Context } from "telegramsjs";
import { UserFromGetMe, Update } from "@telegram.ts/types";
import { DataFunction } from "context";
import { AoijsError, AoiStopping } from "./AoiError";
import { AoiManager, DatabaseOptions } from "./AoiManager";
import { Runtime } from "../Runtime";
import { version } from "../../package.json";

type AllowedUpdates = ReadonlyArray<Exclude<keyof Update, "update_id">>;

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
 * A class that extends TelegramBot and provides additional functionality for handling commands and messages.
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
  async runCode(
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
   *
   * @param {DataFunction|DataFunction[]} options - The data function(s) to add.
   * @returns {void}
   */
  addFunction(options: DataFunction | DataFunction[]) {
    if (Array.isArray(options)) {
      for (const optionVersion of options) {
        if (!optionVersion?.name) {
          throw new AoijsError(
            "aoiplugins",
            "You did not specify the 'name' parameter.",
          );
        }
        if ((optionVersion?.version ?? 0) > version) {
          throw new AoijsError(
            "aoiplugins",
            `To load this function ${optionVersion?.name}, the library version must be equal to or greater than ${
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
          "You did not specify the 'name' parameter.",
        );
      }
      if ((options?.version ?? 0) > version) {
        throw new AoijsError(
          "aoiplugins",
          `To load this function ${
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
        "You did not specify the 'code' parameter.",
      );
    }
    super.on("ready", async (ctx) => {
      await this.runCode({ event: "ready" }, options.code, ctx);
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
        "You did not specify the 'code' parameter.",
      );
    }
    super.on("message", async (ctx) => {
      await this.runCode({ event: "message" }, options.code, ctx);
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
        "You did not specify the 'code' parameter.",
      );
    }
    super.on("callback_query", async (ctx) => {
      await this.runCode({ event: "callback_query" }, options.code, ctx);
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

export { AoiBase, TelegramOptions };
