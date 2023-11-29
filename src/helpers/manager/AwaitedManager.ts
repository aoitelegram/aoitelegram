import { AoiClient } from "../../classes/AoiClient";
import { AoijsError } from "../../classes/AoiError";

/**
 * Manager for handling awaited events.
 */
class AwaitedManager {
  /**
   * A reference to the AoiClient instance.
   */
  private telegram: AoiClient;

  /**
   * Constructs the AwaitedManager instance.
   * @param {AoiClient} telegram - The AoiClient instance.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  /**
   * Adds a new awaited event with specified options.
   * @param {string} awaited - The name or identifier of the awaited event.
   * @param {object} options - Options for the awaited event.
   * @param {number} options.milliseconds - The time to wait for the awaited event in milliseconds.
   * @param {object} options.data - Additional data associated with the awaited event.
   * @param {unknown} options.context - The context or additional information for the awaited event.
   */
  addAwaited(
    awaited: string,
    options: {
      milliseconds: number;
      data: object;
      context: unknown;
    },
  ) {
    if (options.milliseconds <= 50) {
      throw new AoijsError(
        "timeout",
        `the specified time should be greater than 50 milliseconds. Awaited: ${awaited}`,
      );
    }

    this.telegram.emit(
      "awaited",
      { awaited, data: options.data, milliseconds: options.milliseconds },
      options.context,
    );
  }
}

export { AwaitedManager };
