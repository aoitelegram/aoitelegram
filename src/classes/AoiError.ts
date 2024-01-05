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

export { AoijsError };
