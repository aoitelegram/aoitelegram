import { AoiClient } from "../classes/AoiClient";
import { getObjectKey } from "../function/parser";
import { ValueDatabase } from "./manager/TimeoutManager";

interface TimeoutDescription {
  id: string;
  code: string;
}

interface Data {
  [key: string]: any;
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

        const timeoutDataParsed = context.data as Data;

        this.telegram.addFunction({
          name: "$timeoutData",
          callback: async (ctx) => {
            const args = await ctx.getEvaluateArgs();
            return (
              getObjectKey(timeoutDataParsed, args[0] as string) ||
              timeoutDataParsed
            );
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
