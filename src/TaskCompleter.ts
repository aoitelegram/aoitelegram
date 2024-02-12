import { Context } from "./Context";
import { Collection } from "telegramsjs";
import { AoiClient } from "./classes/AoiClient";
import { AoijsError } from "./classes/AoiError";
import { AoiManager } from "./classes/AoiManager";
import { MongoDBManager } from "./classes/MongoDBManager";
import { getObjectKey } from "./function/parser";
import {
  unpack,
  replaceLast,
  findAndTransform,
  updateParamsFromArray,
} from "./prototype";
import {
  ContextEvent,
  LibDataFunction,
  LibWithDataFunction,
} from "./classes/AoiTyping";

class TaskCompleter {
  context?: Context;
  searchedFunctions: string[];
  foundFunctions: { func: string; negative: boolean }[] = [];
  eventData: ContextEvent;
  code: string;
  telegram: AoiClient;
  callback_query: unknown[] = [];
  command: {
    name: string;
    hasCommand?: boolean;
    hasEvent?: boolean;
  };
  database: AoiManager | MongoDBManager;
  availableFunction: Collection<string, LibWithDataFunction>;
  isError: boolean = false;
  onlySearchFunction: string[];
  searchNegationFunction: string[];
  suppressErrors?: string;
  executionTime: number = performance.now();

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
    eventData: ContextEvent,
    telegram: AoiClient,
    command: { name: string; hasCommand?: boolean; hasEvent?: boolean },
    database: AoiManager | MongoDBManager,
    availableFunction: Collection<string, LibWithDataFunction>,
    onlySearchFunction: string[],
  ) {
    this.searchedFunctions = [];
    this.eventData = eventData;
    this.telegram = telegram;
    this.command = command;
    this.database = database;
    this.availableFunction = availableFunction;
    this.onlySearchFunction = onlySearchFunction;
    this.searchNegationFunction = onlySearchFunction.map((func) =>
      func.replace("$", "$!"),
    );
    this.code = findAndTransform(code, [
      ...onlySearchFunction,
      ...this.searchNegationFunction,
    ]);
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
    let onlySearchFunctions = this.onlySearchFunction.concat(
      ...this.searchNegationFunction,
    );
    let foundFunctions = [];

    let matchingFunctions = onlySearchFunctions.filter((func) =>
      this.code.includes(func),
    );

    const functionSegments = this.code.split("$");
    for (const functionSegment of functionSegments) {
      if (functionSegment.startsWith("!")) {
        let matchingFunction = matchingFunctions.filter(
          (func) => func === `$${functionSegment}`.slice(0, func.length),
        );

        if (matchingFunction.length === 1) {
          foundFunctions.push({ func: matchingFunction[0], negative: true });
        } else if (matchingFunction.length > 1) {
          foundFunctions.push({
            func: matchingFunction.sort((a, b) => b.length - a.length)[0],
            negative: true,
          });
        }
      } else {
        let matchingFunction = matchingFunctions.filter(
          (func) => func === `$${functionSegment}`.slice(0, func.length),
        );

        if (matchingFunction.length === 1) {
          foundFunctions.push({ func: matchingFunction[0], negative: false });
        } else if (matchingFunction.length > 1) {
          foundFunctions.push({
            func: matchingFunction.sort((a, b) => b.length - a.length)[0],
            negative: false,
          });
        }
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
      code = replaceLast(
        code,
        `$if[${entireBlock}$endif`,
        (pass ? ifCodeBlock : passes ? lastCodeBlock : elseCodeBlock) as string,
      );
    }
    return code;
  }

  /**
   * Asynchronously completes a task using Aoi.
   * @param func - The name of the function.
   * @param negative - Whether the function is negated or not.
   * @param context - The context function containing necessary contextual callback.
   * @param callback - Either a string of code or a function to be executed.
   * @returns A promise that resolves once the task is completed.
   */
  async completeTaskCallback(
    func: string,
    negative: boolean,
    context: Context,
    callback:
      | { code: string; params?: string[] }
      | ((context: Context) => unknown),
  ) {
    if (typeof callback === "function") {
      try {
        const result = await callback(context);

        this.context = context;
        if (context.telegram?.globalVars) {
          this.telegram.globalVars = context.telegram.globalVars;
        }

        return result;
      } catch (err) {
        if (negative) {
          return undefined;
        } else if (`${err}`.includes("TelegramApiError")) {
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
        const availableFunction = this.availableFunction;

        availableFunction.set("$argumentscount", {
          name: "$argumentscount",
          callback: () => context.splits.length,
        });

        const taskCompleter = new TaskCompleter(
          code,
          this.eventData,
          this.telegram,
          this.command,
          this.database,
          availableFunction,
          [...this.onlySearchFunction, "$argumentscount"],
        );
        return await taskCompleter.completeTask();
      } catch (err) {
        if (negative) return undefined;
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
    this.code = this.code.replace(
      /\$executiontime/gi,
      (performance.now() - this.executionTime).toFixed(3),
    );

    for (const { func, negative } of this.foundFunctions.reverse()) {
      const codeSegment = unpack(this.code, func.toLowerCase());

      const functionName = func.replace(/[$![]/g, "");

      const dataContext = new Context({
        inside: codeSegment.inside,
        splits: codeSegment.splits.map((inside) =>
          inside.trim() === "" ? undefined : inside,
        ),
        event: this.eventData,
        telegram: this.telegram,
        database: this.database,
        command: this.command,
        negative,
        currentFunction: func,
        data: {
          localVars: this.context?.localVars,
          random: this.context?.random,
          buffer: this.context?.buffer,
          array: this.context?.array,
          callback_query: this.context?.callback_query,
          suppressErrors: this.context?.suppressErrors,
        },
      });

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
        negative,
        dataContext,
        "callback" in functionRun ? functionRun.callback : functionRun,
      );

      const funcLowerCase = func.toLowerCase();
      const segment =
        codeSegment.splits.length > 0
          ? `${funcLowerCase}[${codeSegment.inside}]`
          : `${funcLowerCase}`;
      this.code = replaceLast(this.code, segment, `${resultFunction}`);

      const isError = dataContext.isError || this.isError;
      if (isError && !negative) {
        this.code = "";
        break;
      } else if (dataContext.isError && negative) {
        dataContext.isError = false;
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
    if (this.context?.suppressErrors && this.eventData?.send) {
      return this.eventData.send(this.context.suppressErrors, {
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
      this.telegram.emit("functionError", this.eventData, this.telegram);
    } else {
      throw new AoijsError(undefined, error, this.command.name, functionName);
    }
  }
}

export { TaskCompleter };
