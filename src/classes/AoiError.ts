/**
 * Extracts the content inside <code> tags from the provided HTML-like string.
 * @param inputString - The input string containing HTML-like structure.
 * @returns The content inside <code> tags, or null if not found.
 */
function extractCodeContent(inputString: string) {
  const codeRegex = /<code>(.*?)<\/code>/;
  const match = inputString.match(codeRegex);
  return match ? match[1] : inputString;
}

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
    super(extractCodeContent(description));

    /**
     * The name or category of the error.
     */
    this.name = name ? `AoijsError[${name}]` : `AoijsError`;

    /**
     * A description of the error.
     */
    this.description = extractCodeContent(description);

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
