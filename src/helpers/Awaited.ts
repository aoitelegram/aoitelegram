import { setInterval, clearInterval } from "node:timers";
import { AoiClient } from "../classes/AoiClient";
import { getObjectKey } from "../function/parser";

interface AwaitedDescription {
  awaited: string;
  code: string;
}

interface AwaitedEvent {
  awaited: string;
  milliseconds: number;
  data: object;
  code: string;
}

/**
 * Represents a manager for handling awaited events.
 */
class Awaited {
  /**
   * Array to store awaited descriptions.
   */
  private awaiteds: AwaitedDescription[] = [];

  /**
   * A reference to the AoiClient instance.
   */
  private telegram: AoiClient;

  /**
   * Constructs the Awaited instance.
   * @param {AoiClient} telegram - The AoiClient instance.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  /**
   * Registers a new awaited description.
   * @param {AwaitedDescription} awaited - The awaited description to register.
   * @returns {Awaited} The Awaited instance.
   */
  register(awaited: AwaitedDescription): Awaited {
    const existingIndex = this.awaiteds.findIndex(
      (map) => map.awaited === awaited.awaited,
    );
    if (existingIndex !== -1) {
      this.awaiteds[existingIndex] = awaited;
    } else {
      this.awaiteds.push(awaited);
    }

    return this;
  }

  /**
   * Sets up a handler for awaited events.
   */
  handler(): void {
    this.telegram.on("awaited", async (awaited, context) => {
      for (const awaitedDescription of this.awaiteds) {
        if (awaitedDescription.awaited !== awaited.awaited) continue;

        const intervalId = setInterval(async () => {
          const awaitedData = awaited.data;
          this.telegram.addFunction([
            {
              name: "$awaitedData",
              callback: async (ctx) => {
                const args = await ctx.getEvaluateArgs();
                return (
                  getObjectKey(awaitedData, args[0] as string) || awaitedData
                );
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

export { Awaited, AwaitedDescription, AwaitedEvent };
