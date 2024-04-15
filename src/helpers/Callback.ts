import { AoiClient } from "../classes/AoiClient";
import { AoijsError } from "../classes/AoiError";
import type { Container } from "../classes/core/";
import { Collection } from "@telegram.ts/collection";

interface AoiCallbackDescription {
  name: string;
  type: "aoitelegram";
  code: string;
}

interface JsCallbackDescription {
  name: string;
  type?: "js";
  callback: (
    args: (string | undefined)[],
    context: Container["eventData"],
  ) => unknown;
}

type CallbackDescription = AoiCallbackDescription | JsCallbackDescription;

class Callback {
  public readonly callbacks: Collection<string, CallbackDescription> =
    new Collection();
  public readonly telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  register(callback: CallbackDescription): Callback {
    const existingIndex = this.callbacks.has(callback.name);

    if (!existingIndex) {
      this.callbacks.set(callback.name, callback);
    } else {
      throw new AoijsError(
        "callback",
        `the callback "${callback.name}" already exists`,
      );
    }

    return this;
  }

  async runCallback(
    name: string,
    args: string[],
    context: Container["eventData"],
  ): Promise<boolean | string> {
    if (!name) {
      throw new AoijsError(
        "callback",
        "you did not specify the 'name' parameter",
      );
    }

    const callback = this.callbacks.get(name);
    if (!callback) return false;

    if (callback.type === "aoitelegram" && callback.code) {
      let resultFunc = "";

      this.telegram.ensureCustomFunction({
        name: "$arguments",
        brackets: true,
        fields: [
          {
            required: false,
          },
        ],
        callback: async (context, func) => {
          const result = Number(await func.resolveAllFields(context));
          return func.resolve(result ? args[result - 1] : args[0]);
        },
      });

      this.telegram.ensureCustomFunction({
        name: "$argumentsCount",
        brackets: false,
        callback: (context, func) => func.resolve(func.fields.length),
      });

      this.telegram.ensureCustomFunction({
        name: "$return",
        brackets: true,
        fields: [
          {
            required: false,
          },
        ],
        callback: async (context, func) => {
          resultFunc = await func.resolveAllFields(context);
          return func.reject();
        },
      });

      const result = await this.telegram.evaluateCommand(callback, context);

      return `${resultFunc || result}`;
    }

    if ((callback.type === "js" || !callback.type) && callback.callback) {
      const result = await callback.callback(args, context);
      return `${result}`;
    }

    throw new AoijsError(
      "callback",
      "the passed parameters do not match the expected ones",
    );
  }
}

export { Callback, CallbackDescription };
