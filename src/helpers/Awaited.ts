import { getObjectKey } from "../utils/";
import { AoiClient } from "../classes/AoiClient";
import { AoijsError } from "../classes/AoiError";
import { Collection } from "@telegram.ts/collection";
import { setInterval, clearInterval } from "long-timeout";

interface AwaitedDescription {
  awaited: string;
  code: string;
  useNative?: Function[];
  [key: string]: unknown;
}

class Awaited {
  awaiteds: Collection<string, AwaitedDescription> = new Collection();

  telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

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

  handler() {
    this.telegram.on("awaited", async (awaited, context) => {
      for (const [awaitedId, awaitedDescription] of this.awaiteds) {
        if (awaitedId !== awaited.awaited) continue;

        let currentIndex = 1;
        const intervalId = setInterval(async () => {
          const parsedAwaitedData = JSON.parse(JSON.stringify(awaited.data));
          this.telegram.ensureFunction([
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
            {
              name: "$continue",
              callback: (context) => (context.isError = true),
            },
            {
              name: "$index",
              callback: () => currentIndex,
            },
          ]);

          await this.telegram.evaluateCommand(
            { event: "awaited" },
            awaitedDescription.code,
            context,
            awaitedDescription.useNative,
          );
          currentIndex++;
        }, awaited.milliseconds);
      }
    });
  }
}

export { Awaited, AwaitedDescription };
