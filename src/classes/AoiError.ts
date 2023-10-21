/**
 * A custom error class for Aoijs with additional properties for error details.
 * @extends Error
 */
class AoijsError extends Error {
  name: string;
  description: string;
  command?: string;
  functions?: string;
  /**
   * Create a new AoijsError instance.
   * @param {string|undefined} name - The name or category of the error.
   * @param {string} description - A description of the error.
   * @param {string} [command] - The name of the command associated with the error.
   * @param {string} [functions] - The name of the function associated with the error.
   */
  constructor(
    name: string | undefined,
    description: string,
    command?: string,
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
     * @type {string|undefined}
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
  telegram: any;
  /**
   * Initializes a new instance of the MessageError class.
   * @param telegram - The Telegram instance used for sending error messages.
   */
  constructor(telegram: any) {
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
      `Expected ${amount} arguments but got ${parameterCount}!`,
    );
    this.telegram.send(text, { parse_mode: "HTML" });
  }

  /**
   * Sends an error message for an invalid variable.
   * @param nameVar - The name of the invalid variable.
   * @param func - The name of the function generating the error.
   */
  errorVar(nameVar: string, func: string) {
    const text = MessageError.createMessageError(
      func,
      `Invalid variable ${nameVar} not found!`,
    );
    this.telegram.send(text, { parse_mode: "HTML" });
  }

  /**
   * Sends an error message for an invalid table.
   * @param table - The name of the invalid table.
   * @param func - The name of the function generating the error.
   */
  errorTable(table: string, func: string) {
    const text = MessageError.createMessageError(
      func,
      `Invalid table ${table} not found!`,
    );
    this.telegram.send(text, { parse_mode: "HTML" });
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

export { AoijsError, MessageError };
