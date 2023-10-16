import { AoijsError } from "./AoiError";

/**
 * Represents a single inline row containing text and callback data.
 * @interface
 */
interface InlineRow {
  text?: string | undefined; // The text displayed for the button.
  callback_data?: string | undefined; // The callback data associated with the button.
}

/**
 * AoiParse class for parsing a specific input format into a structured data format.
 */
class AoiParse {
  /**
   * Creates an instance of AoiParse.
   * @constructor
   */
  constructor() {}

  /**
   * Parses the input string and converts it into a structured data format.
   * @param {string} input - The input string to be parsed.
   * @returns {Object} - The parsed data structure.
   */
  parse(input: string) {
    if (!input) {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'input' parameter.",
      );
    }

    const result: {
      inline_keyboard: InlineRow[];
    } = { inline_keyboard: [] };

    const rows = input.split("}{");

    for (const row of rows) {
      const inlineRow: InlineRow[] = [];
      const buttons = row.split("|");

      buttons.forEach((button) => {
        const [key, text, callbackData] = button.split(":");
        inlineRow.push({ text, callback_data: callbackData.replace(/}/g, "") });
      });

      result.inline_keyboard.push(inlineRow as InlineRow);
    }

    return result;
  }
}

export { AoiParse };
