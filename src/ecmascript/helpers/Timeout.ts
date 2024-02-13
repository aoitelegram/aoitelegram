import { Collection } from "telegramsjs";
import { AoiClient } from "../classes/AoiClient.js";
import { AoijsError } from "../classes/AoiError.js";
import { getObjectKey } from "../function/parser.js";
import { ValueDatabase } from "./manager/TimeoutManager.js";

interface TimeoutDescription {
  id: string;
  code: string;
  useNative?: Function[];
  [key: string]: unknown;
}

/**
 * A class that manages timeouts and associated actions.
 */
class Timeout {
  /**
   * The collection of registered timeouts.
   */
  timeouts: Collection<string, TimeoutDescription> = new Collection();

  /**
   * The AoiClient instance.
   */
  telegram: AoiClient;

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
  register(timeout: TimeoutDescription) {
    const existingIndex = this.timeouts.has(timeout.id);

    if (!existingIndex) {
      this.timeouts.set(timeout.id, timeout);
    } else {
      throw new AoijsError(
        "timeout",
        `the current timeout "${timeout.id}" already exists`,
      );
    }

    return this;
  }

  /**
   * Sets up the event handler for timeouts.
   */
  handler() {
    this.telegram.on("timeout", async (timeoutData, context) => {
      for (const [timeoutId, timeoutDescription] of this.timeouts) {
        if (timeoutId !== context.id) continue;
        if (!this.telegram.timeoutManager.timeouts.has(context.id)) break;

        const parsedTimeoutData = JSON.parse(`${context.data}`);

        this.telegram.ensureFunction({
          name: "$timeoutData",
          callback: (context) => {
            const response = getObjectKey(
              parsedTimeoutData,
              context.inside as string,
            );
            return typeof response === "object"
              ? JSON.stringify(response)
              : response;
          },
        });

        await this.telegram.evaluateCommand(
          { event: "timeout" },
          timeoutDescription.code,
          timeoutData,
          timeoutDescription.useNative,
        );

        this.telegram.timeoutManager.timeouts.delete(context.id);
        break;
      }
    });
  }
}

export { Timeout, TimeoutDescription };
