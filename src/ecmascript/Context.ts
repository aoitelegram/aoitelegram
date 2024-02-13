import { packageJSON } from "./index.js";
import { Collection } from "telegramsjs";
import type PackageJSON from "./package.json";
import { AoiClient } from "./classes/AoiClient.js";
import { AoijsError } from "./classes/AoiError.js";
import { AoiManager } from "./classes/AoiManager.js";
import { ContextEvent } from "./classes/AoiTyping.js";
import { MongoDBManager } from "./classes/MongoDBManager.js";
import { getObjectKey, toParse } from "./function/parser.js";

class Context {
  inside: string | undefined;
  splits: (string | undefined)[];
  localVars: Collection<string, unknown> = new Collection();
  random: Collection<string, unknown> = new Collection();
  buffer: Collection<string, Buffer> = new Collection();
  array: Collection<string, unknown[]> = new Collection();
  callback_query: unknown[] = [];
  event: ContextEvent;
  telegram: AoiClient;
  command: { name: string; hasCommand?: boolean; hasEvent?: boolean };
  isError: boolean = false;
  database: AoiManager | MongoDBManager;
  negative: boolean;
  currentFunction: string;
  suppressErrors?: string;
  packageJSON: typeof packageJSON = packageJSON;

  constructor(options: {
    inside: string | undefined;
    splits: (string | undefined)[];
    event: ContextEvent;
    telegram: AoiClient;
    database: AoiManager | MongoDBManager;
    command: { name: string; hasCommand?: boolean; hasEvent?: boolean };
    negative: boolean;
    currentFunction: string;
    data?: {
      localVars?: Collection<string, unknown>;
      random?: Collection<string, unknown>;
      buffer?: Collection<string, Buffer>;
      array?: Collection<string, unknown[]>;
      callback_query?: unknown[];
      suppressErrors?: string;
    };
  }) {
    this.inside = options.inside;
    this.splits = options.splits;
    this.event = options.event;
    this.telegram = options.telegram;
    this.database = options.database;
    this.command = options.command;
    this.negative = options.negative;
    this.currentFunction = options.currentFunction;
    this.localVars = options.data?.localVars || this.localVars;
    this.random = options.data?.random || this.random;
    this.buffer = options.data?.buffer || this.buffer;
    this.array = options.data?.array || this.array;
    this.callback_query = options.data?.callback_query || this.callback_query;
    this.suppressErrors = options.data?.suppressErrors || this.suppressErrors;
  }

  /**
   * Checks if the specified number of arguments is provided.
   * @param amount The expected number of arguments.
   */
  argsCheck(amount: number) {
    if (!this.splits[0] || this.splits.length < amount) {
      this.sendError(
        `Expected ${amount} arguments but got ${
          this.splits[0] ? this.splits.length : 0
        }`,
      );
    }
  }

  /**
   * Checks if the types of arguments match the expected types.
   * @param expectedArgumentTypes An array of strings representing the expected types of arguments.
   */
  checkArgumentTypes(expectedArgumentTypes: string[]) {
    if (this.isError) return;
    const argument = this.splits;
    for (
      let argumentIndex = 0;
      argumentIndex < argument.length;
      argumentIndex++
    ) {
      const actualArgumentType = toParse(argument[argumentIndex]);
      if (!expectedArgumentTypes[argumentIndex]) {
        expectedArgumentTypes[argumentIndex] = "unknown";
      }
      const expectedArgumentTypeSet = new Set(
        expectedArgumentTypes[argumentIndex]
          .split("|")
          .map((arg) => arg.trim()),
      );

      if (expectedArgumentTypeSet.has("unknown")) continue;

      const isVariadic = new Set(
        expectedArgumentTypes[argumentIndex]
          .split("|")
          .map((arg) => arg.trim().includes("...")),
      ).has(true);
      if (isVariadic) {
        const variadicTypes = new Set(
          expectedArgumentTypes[argumentIndex]
            .split("|")
            .map((arg) => arg.trim())
            .join(" ")
            .split("...")
            .map((arg) => (arg ? arg.trim() : undefined)),
        );
        const variadicTypesName = expectedArgumentTypes[argumentIndex];
        const sliceTypes = argument.slice(argumentIndex);
        for (
          let argumentIndex = 0;
          argumentIndex < sliceTypes.length;
          argumentIndex++
        ) {
          const nextExpectedType = toParse(`${sliceTypes[argumentIndex]}`);
          const actualArgumentType = toParse(`${sliceTypes[argumentIndex]}`);
          if (variadicTypesName.includes("...unknown")) break;
          if (!variadicTypes.has(nextExpectedType)) {
            this.sendError(
              `The ${
                argumentIndex + 1
              }-th argument following the variadic parameter in the function ${this.currentFunction} should be of type ${variadicTypesName}, but the received value is of type ${actualArgumentType}`,
            );
          }
        }
        break;
      } else if (!expectedArgumentTypeSet.has(actualArgumentType)) {
        this.sendError(
          `The ${
            argumentIndex + 1
          }-th argument in the function ${this.currentFunction} should be one of the types ${
            expectedArgumentTypes[argumentIndex]
          }, but the provided value is of type ${actualArgumentType}`,
        );
      }
    }
  }

  /**
   * Sends an error message.
   * @param error The error message to send.
   * @param custom A boolean indicating if the error message is custom.
   */
  sendError(error: string, custom: boolean = false) {
    if (!error) return;
    if (!this.negative) {
      this.isError = true;
      this.#sendErrorMessage(error, custom, this.currentFunction);
    } else this.isError = true;
  }

  /**
   * Sends an error message based on specified conditions.
   * @param error - The error message to be sent.
   * @param custom - Indicates whether the error message is custom.
   * @param functionName - The name of the function where the error occurred.
   * @returns A Promise that resolves when the error message is sent.
   */
  #sendErrorMessage(
    error: string,
    custom: boolean = false,
    functionName: string,
  ) {
    if (this.suppressErrors && this.event?.send) {
      return this.event.send(this.suppressErrors, {
        parse_mode: "HTML",
      });
    } else if (
      this.event?.telegram?.sendMessageError &&
      !this.event?.telegram?.functionError &&
      this.event?.send
    ) {
      return this.event.send(
        custom ? error : `❌ <b>${functionName}:</b> <code>${error}</code>`,
        { parse_mode: "HTML" },
      );
    } else if (this.event?.telegram?.functionError) {
      this.telegram.ensureFunction({
        name: "$handleError",
        callback: (context) => {
          const dataError = {
            error,
            function: functionName,
            hasCommand: this.command.hasCommand ? this.command.name : "",
            hasEvent: this.command.hasEvent ? this.command.name : "",
          };
          return getObjectKey(dataError, context.inside as string);
        },
      });
      this.telegram.emit("functionError", this.event, this.telegram);
    } else {
      throw new AoijsError(undefined, error, this.command.name, functionName);
    }
  }
}

export { Context };
