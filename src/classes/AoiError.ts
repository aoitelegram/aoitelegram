import { type Context } from "telegramsjs";

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
  telegram: Context["telegram"];
  /**
   * Initializes a new instance of the MessageError class.
   * @param telegram - The Telegram instance used for sending error messages.
   */
  constructor(telegram: Context["telegram"]) {
    this.telegram = telegram;
  }

  /**
   * Sends an error message for a function with incorrect argument count.
   * @param amount - The expected number of arguments.
   * @param parameterCount - The actual number of arguments provided.
   * @param func - The name of the function generating the error.
   */
  errorArgs(amount: number, parameterCount: number, func: string) {
    const text = MessageError.createMessageError(
      func,
      `Expected ${amount} arguments but got ${parameterCount}`,
    );
    this.telegram.send(text, { parse_mode: "HTML" });
    throw new AoiStopping("errorArgs");
  }

  /**
   * Sends an error message for an invalid variable.
   * @param nameVar - The name of the invalid variable.
   * @param func - The name of the function generating the error.
   */
  errorVar(nameVar: string, func: string) {
    const text = MessageError.createMessageError(
      func,
      `Invalid variable ${nameVar} not found`,
    );
    this.telegram.send(text, { parse_mode: "HTML" });
    throw new AoiStopping("errorVar");
  }

  /**
   * Sends an error message for an invalid table.
   * @param table - The name of the invalid table.
   * @param func - The name of the function generating the error.
   */
  errorTable(table: string, func: string) {
    const text = MessageError.createMessageError(
      func,
      `Invalid table ${table} not found`,
    );
    this.telegram.send(text, { parse_mode: "HTML" });
    throw new AoiStopping("errorTable");
  }

  /**
   * Reports an error with a specified error type and function name.
   * @param {string} type - The expected data type.
   * @param {string} func - The name of the function.
   */
  errorType(type: string, func: string) {
    const text = MessageError.createMessageError(
      func,
      `Expected type ${type} in function ${func}`,
    );
    this.telegram.send(text, { parse_mode: "HTML" });
    throw new AoiStopping("errorType");
  }

  /**
   * Create and send an error message for an array-related error.
   * @param {string} name - The name of the variable that does not exist.
   * @param {string} func - The name of the function causing the error.
   */
  errorArray(name: string, func: string) {
    const text = MessageError.createMessageError(
      func,
      `The specified variable ${name} does not exist for the array`,
    );
    this.telegram.send(text, { parse_mode: "HTML" });
    throw new AoiStopping("errorArray");
  }

  /**
   * Creates a custom error with a specific description and function name.
   * @param {string} description - A custom description of the error.
   * @param {string} func - The name of the function where the error occurred.
   */
  customError(description: string, func: string) {
    const text = MessageError.createMessageError(func, description);
    this.telegram.send(text, { parse_mode: "HTML" });
    throw new AoiStopping("customError");
  }

  /**
   * Create an MessageError message.
   * @param func - The name of the function.
   * @param details - Details of the error.
   * @param line - Line number of the error.
   */
  static createMessageError(func: string, details: string, line?: number) {
    return `<code>MessageError: ${func}: ${details}\n{ \nline : ${line}, \ncommand : ${func} \n}</code>`;
  }
}

/**
 * Custom error class for Aoi framework to represent a stopping condition.
 * This error is thrown when a specific condition indicates the need to stop further execution.
 */
class AoiStopping extends Error {
  /**
   * Name of the error class.
   */
  name: string;

  /**
   * Creates a new AoiStopping instance with the provided fun.
   * @param fun - A fun or message associated with the error.
   */
  constructor(fun: string) {
    super(`the team is paused due to an error in the ${fun} method.`);
    this.name = "AoiStopping";
  }
}

export { AoijsError, MessageError, AoiStopping };
