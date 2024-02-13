import { Context } from "../Context.js";
import { Collection } from "telegramsjs";
import { AoiClient } from "../classes/AoiClient.js";
import { AoijsError } from "../classes/AoiError.js";

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

/**
 * Class representing a collection of callbacks for an AoiClient instance.
 */
class Callback {
  /**
   * Collection of registered callbacks.
   */
  callbacks: Collection<string, CallbackDescription> = new Collection();

  /**
   * AoiClient instance associated with the Callback class.
   */
  telegram: AoiClient;

  /**
   * Creates an instance of Callback with a reference to the associated AoiClient.
   * @param telegram - The AoiClient instance.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  /**
   * Registers a callback with the given CallbackDescription.
   * @param callback - The CallbackDescription to register.
   * @returns The Callback instance for method chaining.
   */
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

  /**
   * Runs the specified callback with provided arguments and context.
   * @param name - The name of the callback to run.
   * @param args - Array of arguments for the callback.
   * @param context - The context function's event object.
   * @returns The result of the executed callback.
   */
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
