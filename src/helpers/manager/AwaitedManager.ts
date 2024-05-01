import { AoijsError } from "../../classes/AoiError";
import type { AoiClient } from "../../classes/AoiClient";

class AwaitedManager {
  public readonly telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  addAwaited(
    awaited: string,
    options: {
      milliseconds: number;
      data: object;
      context: unknown;
    },
  ): void {
    if (options.milliseconds <= 50) {
      throw new AoijsError(
        `The specified time should be greater than 50 milliseconds. Awaited: ${awaited}`,
        "timeout",
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
