import { Context } from "../Context";
import { AoiManager } from "./AoiManager";
import { Context as EventContext } from "telegramsjs";

/**
 * A custom error class for Aoijs with additional properties for error details.
 * @extends Error
 */
class AoijsError extends Error {
  name: string;
  description: string;
  command?: unknown;
  functions?: string;
  /**
   * Create a new AoijsError instance.
   * @param {string|undefined} name - The name or category of the error.
   * @param {string} description - A description of the error.
   * @param {unknown} [command] - The name of the command associated with the error.
   * @param {string} [functions] - The name of the function associated with the error.
   */
  constructor(
    name: string | undefined,
    description: string,
    command?: unknown,
    functions?: string,
  ) {
    super(description);

    /**
     * The name or category of the error.
     * @type {string}
     */
    this.name = name ? `AoijsError[${name}]` : `AoijsError`;

    /**
     * A description of the error.
     * @type {string}
     */
    this.description = description;

    /**
     * The name of the command associated with the error.
     * @type {unknown}
     */
    this.command = command;

    /**
     * The name of the function associated with the error.
     * @type {string|undefined}
     */
    this.functions = functions;
  }
}

/**
 * Represents a class for handling message errors.
 */
class MessageError {
  telegramInstance: EventContext;
  botContext: Context;
  /**
   * Initializes a new instance of the MessageError class.
   * @param telegram - The Telegram instance used for sending error messages.
   * @param context - The context function
   */
  constructor(telegram: EventContext["telegram"], context: Context) {
    this.telegramInstance = telegram;
    this.botContext = context;
  }

  /**
   * Sends an error message for a function with incorrect argument count.
   * @param amount - The expected number of arguments.
   * @param parameterCount - The actual number of arguments provided.
   * @param func - The name of the function generating the error.
   */
  errorArgs(amount: number, parameterCount: number, func: string) {
    const text = this.createMessageError(
      func,
      `Expected ${amount} arguments but got ${parameterCount}`,
    );
    this.telegramInstance.send(text, { parse_mode: "HTML" });
    throw new AoiStop();
  }

  /**
   * Sends an error message for an invalid variable.
   * @param nameVar - The name of the invalid variable.
   * @param func - The name of the function generating the error.
   */
  errorVar(nameVar: string, func: string) {
    const text = this.createMessageError(
      func,
      `Invalid variable ${nameVar} not found`,
    );
    this.telegramInstance.send(text, { parse_mode: "HTML" });
    throw new AoiStop();
  }

  /**
   * Sends an error message for an invalid table.
   * @param table - The name of the invalid table.
   * @param func - The name of the function generating the error.
   */
  errorTable(table: string, func: string) {
    const text = this.createMessageError(
      func,
      `Invalid table ${table} not found`,
    );
    this.telegramInstance.send(text, { parse_mode: "HTML" });
    throw new AoiStop();
  }

  /**
   * Create and send an error message for an array-related error.
   * @param {string} name - The name of the variable that does not exist.
   * @param {string} func - The name of the function causing the error.
   */
  errorArray(name: string, func: string) {
    const text = this.createMessageError(
      func,
      `The specified variable ${name} does not exist for the array`,
    );
    this.telegramInstance.send(text, { parse_mode: "HTML" });
    throw new AoiStop();
  }

  /**
   * Creates a custom error with a specific description and function name.
   * @param {string} description - A custom description of the error.
   * @param {string} func - The name of the function where the error occurred.
   */
  customError(description: string, func: string, line?: number) {
    const text = this.createMessageError(func, description);
    this.telegramInstance.send(text, { parse_mode: "HTML" });
    throw new AoiStop();
  }

  /**
   * Create an MessageError message.
   * @param func - The name of the function.
   * @param details - Details of the error.
   */
  createMessageError(func: string, details: string) {
    if (
      !this.telegramInstance?.telegram.sendMessageError &&
      this.telegramInstance?.telegram.functionError
    ) {
      this.telegramInstance.telegram.addFunction({
        name: "$handleError",
        callback: async (
          ctx: Context,
          event: EventContext["telegram"],
          database: AoiManager,
          error: MessageError,
        ) => {
          const [property = "error"] = await ctx.getEvaluateArgs();
          ctx.checkArgumentTypes([property as string], error, ["string"]);

          const dataError = {
            error: details,
            function: func,
            command: this.telegramInstance.fileName,
            event: this.telegramInstance.event,
          } as { [key: string]: string | undefined };

          return dataError[property as string] || dataError;
        },
      });
      this.telegramInstance.telegram.emit(
        "functionError",
        this.botContext,
        this.telegramInstance,
      );
      this.telegramInstance.telegram.removeFunction("$handleError");
      throw new AoiStop();
    } else if (
      !this.telegramInstance?.telegram.sendMessageError ||
      !this.telegramInstance.send
    ) {
      throw new ConsoleError(func, details);
    } else {
      return `❌️ <b>${func}:</b> <code>${details}</code>`;
    }
  }
}

/**
 * Custom error class for handling console-related errors.
 */
class ConsoleError extends Error {
  name: string;
  details: string;

  /**
   * Creates an instance of ConsoleError.
   * @param {string} func - The name of the function where the error occurred.
   * @param {string} details - Details or additional information about the error.
   */
  constructor(func: string, details: string) {
    super(details);
    this.name = `ConsoleError[${func}]`;
    this.details = details;
  }
}

class AoiStop extends Error {
  constructor() {
    super();
  }
}

export { AoijsError, MessageError, AoiStop };
