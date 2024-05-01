import { getObjectKey } from "../utils/";
import { AoijsError } from "../classes/AoiError";
import { Collection } from "@telegram.ts/collection";
import type { AoiClient } from "../classes/AoiClient";
import type { ValueDatabase } from "./manager/TimeoutManager";

interface TimeoutDescription {
  id: string;
  code: string;
  [key: string]: unknown;
}

class Timeout {
  public readonly timeouts: Collection<string, TimeoutDescription> =
    new Collection();
  public readonly telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  register(timeout: TimeoutDescription): Timeout {
    const existingIndex = this.timeouts.has(timeout.id);

    if (!existingIndex) {
      this.timeouts.set(timeout.id, timeout);
    } else {
      throw new AoijsError(
        `The current timeout '${timeout.id}' already exists`,
      );
    }

    return this;
  }

  handler(): void {
    this.telegram.on("timeout", async (timeoutData, context) => {
      for (const [timeoutId, timeoutDescription] of this.timeouts) {
        if (`${timeoutId}_${context.date}` !== `${context.id}_${context.date}`)
          continue;
        if (
          !this.telegram.timeoutManager.timeouts.has(
            `${context.id}_${context.date}`,
          )
        )
          break;

        const parsedTimeoutData = JSON.parse(JSON.stringify(context.data));

        this.telegram.ensureCustomFunction({
          name: "$timeoutData",
          brackets: true,
          fields: [
            {
              required: false,
            },
          ],
          callback: async (context, func) => {
            const result = getObjectKey(
              parsedTimeoutData,
              await func.resolveAllFields(context),
            );
            return func.resolve(result);
          },
        });

        await this.telegram.evaluateCommand(timeoutDescription, timeoutData);

        this.telegram.timeoutManager.timeouts.delete(
          `${context.id}_${context.date}`,
        );
        break;
      }
    });
  }
}

export { Timeout, TimeoutDescription };
