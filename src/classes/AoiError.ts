/**
 * A custom error class for Aoijs with additional properties for error details.
 */
class AoijsError extends Error {
  name: string;
  description: string;
  command?: unknown;
  functions?: string;

  /**
   * Create a new AoijsError instance.
   * @param name - The name or category of the error.
   * @param description - A description of the error.
   * @param command - The name of the command associated with the error.
   * @param functions - The name of the function associated with the error.
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
     */
    this.name = name ? `AoijsError[${name}]` : `AoijsError`;

    /**
     * A description of the error.
     */
    this.description = description;

    /**
     * The name of the command associated with the error.
     */
    this.command = command;

    /**
     * The name of the function associated with the error.
     */
    this.functions = functions;
  }
}

export { AoijsError };
