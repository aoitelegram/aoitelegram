import { Collection } from "telegramsjs";
import { setInterval, clearInterval } from "node:timers";
import { AoijsError } from "../classes/AoiError";
import { AoiClient } from "../classes/AoiClient";
import { getObjectKey } from "../function/parser";

interface AwaitedDescription {
  awaited: string;
  code: string;
}

/**
 * Represents a manager for handling awaited events.
 */
class Awaited {
  /**
   * Collection to store awaited descriptions.
   */
  private awaiteds: Collection<string, AwaitedDescription> = new Collection();

  /**
   * A reference to the AoiClient instance.
   */
  private telegram: AoiClient;

  /**
   * Constructs the Awaited instance.
   * @param telegram - The AoiClient instance.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  /**
   * Registers a new awaited description.
   * @param awaited - The awaited description to register.
   * @returns The Awaited instance.
   */
  register(awaited: AwaitedDescription) {
    const existingIndex = this.awaiteds.has(awaited.awaited);

    if (!existingIndex) {
      this.awaiteds.set(awaited.awaited, awaited);
    } else {
      throw new AoijsError(
        "awaited",
        `the awaited "${awaited.awaited}" already exists`,
      );
    }

    return this;
  }

  /**
   * Sets up a handler for awaited events.
   */
  handler() {
    this.telegram.on("awaited", async (awaited, context) => {
      for (const [awaitedId, awaitedDescription] of this.awaiteds) {
        if (awaitedId !== awaited.awaited) continue;

        const intervalId = setInterval(async () => {
          const parsedAwaitedData = JSON.parse(awaited.data);
          this.telegram.addFunction([
            {
              name: "$awaitedData",
              callback: (context) => {
                const response = getObjectKey(
                  parsedAwaitedData,
                  context.inside as string,
                );
                return typeof response === "object"
                  ? JSON.stringify(response)
                  : response;
              },
            },
            {
              name: "$break",
              callback: () => clearInterval(intervalId),
            },
          ]);

          await this.telegram.evaluateCommand(
            { event: "awaited" },
            awaitedDescription.code,
            context,
          );

          this.telegram.removeFunction(["$awaitedData", "$break"]);
        }, awaited.milliseconds);
      }
    });
  }
}

export { Awaited, AwaitedDescription };
