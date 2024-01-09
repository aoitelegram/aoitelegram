import { AoiClient } from "../classes/AoiClient";
import { getObjectKey } from "../function/parser";
import { ValueDatabase } from "./manager/TimeoutManager";

interface TimeoutDescription {
  id: string;
  code: string;
}

/**
 * A class that manages timeouts and associated actions.
 */
class Timeout {
  /**
   * The array of registered timeouts.
   */
  private timeouts: TimeoutDescription[] = [];

  /**
   * The AoiClient instance.
   */
  private telegram: AoiClient;

  /**
   * Constructs a new Timeout instance.
   * @param telegram The AoiClient instance.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  /**
   * Registers a timeout with the specified ID and code.
   * @param timeout The timeout description.
   * @returns The Timeout instance for chaining.
   */
  register(timeout: TimeoutDescription): Timeout {
    const existingIndex = this.timeouts.findIndex(
      (map) => map.id === timeout.id,
    );
    if (existingIndex !== -1) {
      this.timeouts[existingIndex] = timeout;
    } else {
      this.timeouts.push(timeout);
    }

    return this;
  }

  /**
   * Sets up the event handler for timeouts.
   */
  handler() {
    this.telegram.on("timeout", async (timeoutData, context) => {
      for (const timeout of this.timeouts) {
        if (timeout.id !== context.id) continue;

        const timeoutDataParsed = JSON.parse(`${context.data}`);

        this.telegram.addFunction({
          name: "$timeoutData",
          callback: (context) => {
            const response = getObjectKey(
              timeoutDataParsed,
              context.inside as string,
            );
            return typeof response === "object"
              ? JSON.stringify(response)
              : response;
          },
        });

        await this.telegram.evaluateCommand(
          { event: "timeout" },
          timeout.code,
          timeoutData,
        );

        this.telegram.removeFunction("$timeoutData");
        break;
      }
    });
  }
}

export { Timeout, TimeoutDescription };
