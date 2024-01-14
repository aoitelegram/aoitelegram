import { AoiClient } from "./classes/AoiClient";
import { AoijsError } from "./classes/AoiError";
import { Context, Collection } from "telegramsjs";
import { AoiManager } from "./classes/AoiManager";
import { MongoDBManager } from "./classes/MongoDBManager";
import { getObjectKey, toParse } from "./function/parser";
import { ConditionChecker } from "./function/condition";
import { unpack, findAndTransform, updateParamsFromArray } from "./prototype";
import {
  DataFunction,
  LibDataFunction,
  LibWithDataFunction,
} from "./classes/AoiTyping";

interface ContextFunction {
  data: { name: string; inside?: string; splits: string[] }[];
  inside: string | undefined;
  splits: (string | undefined)[];
  localVars: Collection<string, unknown>;
  random: Collection<string, unknown>;
  array: Collection<string, unknown>;
  callback_query: unknown[];
  event: Context & { telegram: AoiClient };
  telegram: AoiClient;
  code: string;
  command: { name: string; hasCommand?: boolean; hasEvent?: boolean };
  isError: boolean;
  argsCheck: (amount: number) => unknown;
  checkArgumentTypes: (expectedArgumentTypes: string[]) => void;
  sendError: (error: string, custom?: boolean) => unknown;
  database: AoiManager | MongoDBManager;
  foundFunctions: string[];
  suppressErrors?: string;
}

class TaskCompleter {
  private data: { name: string; inside?: string; splits: string[] }[];
  private suppressError?: string;
  private localVars: Collection<string, unknown> = new Collection();
  private array: Collection<string, unknown> = new Collection();
  private random: Collection<string, unknown> = new Collection();
  private searchedFunctions: string[];
  private foundFunctions: string[] = [];
  private code: string;
  private eventData: Context & { telegram: AoiClient };
  private isError: boolean = false;
  private telegram: AoiClient;
  private callback_query: unknown[] = [];
  private command: {
    name: string;
    hasCommand?: boolean;
    hasEvent?: boolean;
  };
  private database: AoiManager | MongoDBManager;
  private availableFunction: Collection<string, LibWithDataFunction>;
  private onlySearchFunction: string[];

  /**
   * Constructor for TaskCompleter class.
   * @param code - The string of code.
   * @param eventData - The event data containing a Telegram instance.
   * @param telegram - The AoiClient instance.
   * @param command - The command object with name, command, and event properties.
   * @param database - The AoiManager instance.
   * @param availableFunction - The run functions.
   * @param onlySearchFunction - The array of strings to parse.
   */
  constructor(
    code: string,
    eventData: Context & { telegram: AoiClient },
    telegram: AoiClient,
    command: { name: string; hasCommand?: boolean; hasEvent?: boolean },
    database: AoiManager | MongoDBManager,
    availableFunction: Collection<string, LibWithDataFunction>,
    onlySearchFunction: string[],
  ) {
    this.data = [];
    this.searchedFunctions = [];
    this.eventData = eventData;
    this.telegram = telegram;
    this.command = command;
    this.database = database;
    this.availableFunction = availableFunction;
    this.onlySearchFunction = onlySearchFunction;
    this.code = findAndTransform(code, onlySearchFunction);
    this.foundFunctions = this.searchFunctions();
  }

  /**
   * Escapes special characters in a input for use in a regex.
   * @param input - The input to escape special characters from.
   * @returns The input with escaped special characters.
   */
  escapeRegex(input: string) {
    return input.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  /**
   * Searches for functions in code segments based on parser functions.
   * @param codeSegments - Array of code segments to search within.
   * @param parserFunctions - Array of onlySearchFunction functions.
   * @returns Array of found functions.
   */
  searchFunctions() {
    let onlySearchFunctions = this.onlySearchFunction;
    let foundFunctions = [];
    let matchingFunctions = onlySearchFunctions.filter((func) =>
      this.code.includes(func),
    );
    const functionSegments = this.code.split("$");
    for (const functionSegment of functionSegments) {
      let matchingFunction = matchingFunctions.filter(
        (func) => func === `$${functionSegment}`.slice(0, func.length),
      );

      if (!matchingFunction.length) {
        continue;
      }

      if (matchingFunction.length === 1) {
        foundFunctions.push(matchingFunction[0]);
      } else if (matchingFunction.length > 1) {
        foundFunctions.push(
          matchingFunction.sort((a, b) => b.length - a.length)[0],
        );
      }
    }

    return foundFunctions;
  }

  /**
   * Asynchronously completes conditional blocks within the provided input code.
   * @param inputCode - The input code containing conditional blocks.
   * @returns The modified code after completing the conditional blocks.
   */
  async completesV4If(inputCode: string) {
    let code = inputCode;
    if (!code.toLowerCase().includes("$if[")) return code;
    for (let ifBlock of code
      .split(/\$if\[/gi)
      .slice(1)
      .reverse()) {
      const ifOccurrences = code.toLowerCase().split("$if[").length - 1;

      if (!code.toLowerCase().includes("$endif")) {
        this.#sendErrorMessage(`is missing $endif`, false, "$if");
        return "";
      }

      const entireBlock = code
        .split(/\$if\[/gi)
        [ifOccurrences].split(/\$endif/gi)[0];

      ifBlock = code.split(/\$if\[/gi)[ifOccurrences].split(/\$endif/gi)[0];

      let condition = ifBlock.split("\n")[0].trim();

      condition = condition.slice(0, condition.length - 1);

      let pass = false;
      try {
        const taskCompleter = new TaskCompleter(
          `$checkCondition[${condition}]`,
          this.eventData,
          this.telegram,
          this.command,
          this.database,
          this.availableFunction,
          this.onlySearchFunction,
        );
        const response = await taskCompleter.completeTask();
        pass = response.trim() == "true";
      } catch (err) {
        pass = false;
      }

      const hasElseIf = ifBlock.toLowerCase().includes("$elseif");

      const elseIfBlocks: { [key: string]: string } = {};

      if (hasElseIf) {
        for (const elseIfData of ifBlock.split(/\$elseif\[/gi).slice(1)) {
          if (!elseIfData.toLowerCase().includes("$endelseif")) {
            this.#sendErrorMessage(`is missing $endelseIf!`, false, "$elseIf");
            return "";
          }

          const insideBlock = elseIfData.split(/\$endelseIf/gi)[0];

          let elseIfCondition = insideBlock.split("\n")[0].trim();

          elseIfCondition = elseIfCondition.slice(
            0,
            elseIfCondition.length - 1,
          );

          const elseIfCode = insideBlock.split("\n").slice(1).join("\n");

          elseIfBlocks[elseIfCondition] = elseIfCode;

          ifBlock = ifBlock.replace(
            new RegExp(
              `\\$elseif\\[${this.escapeRegex(insideBlock)}\\$endelseif`,
              "mi",
            ),
            "",
          );
        }
      }

      const hasElse = ifBlock.toLowerCase().includes("$else");

      const ifCodeBlock = hasElse
        ? ifBlock
            .split("\n")
            .slice(1)
            .join("\n")
            .split(/\$else/gi)[0]
        : ifBlock
            .split("\n")
            .slice(1)
            .join("\n")
            .split(/\$endif/gi)[0];

      const elseCodeBlock = hasElse
        ? ifBlock.split(/\$else/gi)[1].split(/\$endif/gi)[0]
        : "";

      let passes = false;

      let lastCodeBlock;

      if (hasElseIf) {
        for (const elseIfEntry of Object.entries(elseIfBlocks)) {
          if (!passes) {
            let response = false;
            try {
              const taskCompleter = new TaskCompleter(
                `$checkCondition[${elseIfEntry[0]}]`,
                this.eventData,
                this.telegram,
                this.command,
                this.database,
                this.availableFunction,
                this.onlySearchFunction,
              );
              const result = await taskCompleter.completeTask();
              response = result.trim() == "true";
            } catch (err) {
              response = false;
            }
            if (response) {
              passes = true;
              lastCodeBlock = elseIfEntry[1];
            }
          }
        }
      }

      code = code.replace(/\$if\[/gi, "$if[").replace(/\$endif/gi, "$endif");
      code = code.replaceLast(
        `$if[${entireBlock}$endif`,
        (pass ? ifCodeBlock : passes ? lastCodeBlock : elseCodeBlock) as string,
      );
    }
    return code;
  }

  /**
   * Asynchronously completes a task using Aoi.
   * @param func - The name of the function.
   * @param context - The context function containing necessary contextual callback.
   * @param callback - Either a string of code or a function to be executed.
   * @returns A promise that resolves once the task is completed.
   */
  async completeTaskCallback(
    func: string,
    context: ContextFunction,
    callback:
      | { code: string; params?: string[] }
      | ((context: ContextFunction) => unknown),
  ) {
    if (typeof callback === "function") {
      try {
        const result = await callback(context);

        this.suppressError = context.suppressErrors || this.suppressError;
        this.localVars = context.localVars || this.localVars;
        this.array = context.array || this.array;
        this.random = context.random || this.random;
        this.callback_query = context.callback_query || this.callback_query;
        if (context.telegram?.globalVars) {
          this.telegram.globalVars = context.telegram.globalVars;
        }

        return result;
      } catch (err) {
        if (`${err}`.includes("TelegramApiError")) {
          const text = `❌ <b>TelegramApiError[$${func}]:</b><code>${`${err}`
            .split(":")
            .slice(1)
            .join(" ")}</code>`;
          this.#sendErrorMessage(text, true, func);
        } else {
          const text = `❌ <b>Error[$${func}]:</b><code>${`${err}`
            .split(":")
            .slice(1)
            .join(" ")}</code>`;
          this.#sendErrorMessage(text, true, func);
        }
        this.isError = true;
      }
    } else if (typeof callback.code === "string") {
      try {
        const code = updateParamsFromArray(
          callback.code,
          callback.params || [],
          context.splits,
        );
        const taskCompleter = new TaskCompleter(
          code,
          this.eventData,
          this.telegram,
          this.command,
          this.database,
          this.availableFunction,
          this.onlySearchFunction,
        );
        return await taskCompleter.completeTask();
      } catch (err) {
        console.log(err);
      }
    } else {
      new AoijsError(
        undefined,
        "the specified parameters for creating a custom function do not match the requirements",
        "addFunction",
        func,
      );
    }
  }

  /**
   * Completes the task by processing found functions in reverse.
   */
  async completeTask() {
    this.code = await this.completesV4If(this.code);
    this.foundFunctions = await this.searchFunctions();
    for (const func of this.foundFunctions.reverse()) {
      const codeSegment = unpack(this.code, func.toLowerCase());

      this.data.push({
        name: func,
        inside: codeSegment.inside,
        splits: codeSegment.splits,
      });

      const functionName = func.replace("$", "").replace("[", "");

      const dataContext: ContextFunction = {
        data: this.data,
        inside: codeSegment.inside,
        splits: codeSegment.splits.map((inside) =>
          inside.trim() === "" ? undefined : inside,
        ),
        localVars: this.localVars,
        random: this.random,
        array: this.array,
        callback_query: this.callback_query,
        event: this.eventData,
        telegram: this.telegram,
        code: this.code,
        command: this.command,
        isError: false,
        argsCheck: (amount) => {
          if (!dataContext.splits[0] || dataContext.splits.length < amount) {
            dataContext.sendError(
              `Expected ${amount} arguments but got ${
                dataContext.splits[0] ? dataContext.splits.length : 0
              }`,
            );
          }
        },
        checkArgumentTypes(expectedArgumentTypes: string[]) {
          if (dataContext.isError) return;
          const argument = dataContext.splits;
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
                const nextExpectedType = toParse(
                  `${sliceTypes[argumentIndex]}`,
                );
                const actualArgumentType = toParse(
                  `${sliceTypes[argumentIndex]}`,
                );
                if (variadicTypesName.includes("...unknown")) break;
                if (!variadicTypes.has(nextExpectedType)) {
                  dataContext.sendError(
                    `The ${
                      argumentIndex + 1
                    }-th argument following the variadic parameter in the function ${functionName} should be of type ${variadicTypesName}, but the received value is of type ${actualArgumentType}`,
                  );
                }
              }
              break;
            } else if (!expectedArgumentTypeSet.has(actualArgumentType)) {
              dataContext.sendError(
                `The ${
                  argumentIndex + 1
                }-th argument in the function ${functionName} should be one of the types ${
                  expectedArgumentTypes[argumentIndex]
                }, but the provided value is of type ${actualArgumentType}`,
              );
            }
          }
        },
        sendError: (error, custom) => {
          if (!error) return;
          dataContext.isError = true;
          this.#sendErrorMessage(error, custom, func);
        },
        database: this.database,
        foundFunctions: this.foundFunctions,
      };

      const functionRun = this.availableFunction.get(
        `$${functionName.toLowerCase()}`,
      );

      if (!functionRun) {
        throw new AoijsError(
          undefined,
          `Function '$${functionName}' not found`,
          this.command.name,
        );
      }

      let resultFunction = await this.completeTaskCallback(
        functionName,
        dataContext,
        "callback" in functionRun ? functionRun.callback : functionRun,
      );

      this.code = this.code.replaceLast(
        codeSegment.splits.length > 0
          ? `${func.toLowerCase()}[${codeSegment.inside}]`
          : `${func.toLowerCase()}`,
        `${resultFunction}`,
      );

      if (dataContext.isError || this.isError) {
        this.code = "";
        break;
      }
    }
    return this.code;
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
    if (this.suppressError && this.eventData?.send) {
      return this.eventData.send(this.suppressError, {
        parse_mode: "HTML",
      });
    } else if (
      this.eventData?.telegram?.sendMessageError &&
      !this.eventData?.telegram?.functionError &&
      this.eventData?.send
    ) {
      return this.eventData.send(
        custom ? error : `❌ <b>${functionName}:</b> <code>${error}</code>`,
        { parse_mode: "HTML" },
      );
    } else if (this.eventData?.telegram?.functionError) {
      this.telegram.addFunction({
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
      this.telegram.emit("functionError", this.eventData, this.telegram);
      this.telegram.removeFunction("$handleError");
    } else {
      throw new AoijsError(undefined, error, this.command.name, functionName);
    }
  }
}

export { TaskCompleter, ContextFunction };
