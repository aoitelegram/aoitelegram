import { TelegramBot, type Context } from "telegramsjs";
import { UserFromGetMe, Update } from "@telegram.ts/types";
import { AoijsError } from "./AoiError";
import { Runtime } from "../Runtime";

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
  /**
   * Creates a new instance of AoiBase.
   * @param {string} token - The token for authentication.
   * @param {TelegramOptions} telegram - Configuration options for the Telegram integration.
   */
  constructor(token: string, telegram: TelegramOptions = {}) {
    super(token, telegram);
  }

  /**
   * Executes a block of code in response to a command.
   * @param {string} command - The name of the command.
   * @param {string} code - The code to be executed.
   * @param {(TelegramBot & Context) | UserFromGetMe} telegram - The context or user for executing the code.
   */
  async runCode(
    command: string,
    code: string,
    telegram: (TelegramBot & Context) | UserFromGetMe,
  ) {
    const runtime = new Runtime(telegram);
    await runtime.runInput(command, code);
  }

  /**
   * Registers a code block to be executed when the bot is ready.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when the bot is ready.
   */
  readyCommand(options: { code: string }) {
    if (!options?.code)
      throw new AoijsError("You did not specify the 'code' parameter.");
    super.on("ready", async (ctx) => {
      await this.runCode("ready", options.code, ctx);
    });
  }

  /**
   * Registers a code block to be executed in response to a message.
   * @param {Object} options - Command options.
   * @param {string} options.code - The code to be executed when a message is received.
   */
  messageCommand(options: { code: string }) {
    if (!options?.code)
      throw new AoijsError("You did not specify the 'code' parameter.");
    super.on("message", async (ctx) => {
      await this.runCode("command", options.code, ctx);
    });
  }
}

export { AoiBase, TelegramOptions };
