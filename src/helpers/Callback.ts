import { Collection } from "telegramsjs";
import { Context } from "../classes/core/";
import { AoiClient } from "../classes/AoiClient";
import { AoijsError } from "../classes/AoiError";

interface AoiCallbackDescription {
  name: string;
  type: "aoitelegram";
  useNative?: Function[];
  code: string;
}

interface JsCallbackDescription {
  name: string;
  type?: "js";
  callback: (
    args: (string | undefined)[],
    context: Context["event"],
  ) => unknown;
}

type CallbackDescription = AoiCallbackDescription | JsCallbackDescription;

class Callback {
  callbacks: Collection<string, CallbackDescription> = new Collection();

  telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  register(callback: CallbackDescription) {
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

  async runCallback(name: string, args: string[], context: Context["event"]) {
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

      this.telegram.ensureFunction({
        name: "$arguments",
        callback: (context) =>
          context.splits[0] ? args[Number(context.splits[0]) - 1] : args[0],
      });

      this.telegram.ensureFunction({
        name: "$argumentsCount",
        callback: (context) => context.splits.length,
      });

      this.telegram.ensureFunction({
        name: "$return",
        callback: (context) => {
          resultFunc = `${context.inside}`;
          context.isError = true;
        },
      });

      const result = await this.telegram.evaluateCommand(
        { event: "callback" },
        callback.code,
        context,
        callback.useNative,
      );

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
