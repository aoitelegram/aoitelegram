import { Collection } from "telegramsjs";
import { AoiClient } from "../classes/AoiClient";
import { AoijsError } from "../classes/AoiError";
import { getObjectKey } from "../utils/";
import { ValueDatabase } from "./manager/TimeoutManager";

interface TimeoutDescription {
  id: string;
  code: string;
  useNative?: Function[];
  [key: string]: unknown;
}

class Timeout {
  timeouts: Collection<string, TimeoutDescription> = new Collection();

  telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

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

  handler() {
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

        this.telegram.timeoutManager.timeouts.delete(
          `${context.id}_${context.date}`,
        );
        break;
      }
    });
  }
}

export { Timeout, TimeoutDescription };
