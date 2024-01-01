import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Parser } from "./Parser";
import { Context } from "./Context";
import { Evaluator } from "./Evaluator";
import { Environment } from "./Environment";
import { Lexer, TokenArgument } from "./Lexer";
import { AoiClient } from "./classes/AoiClient";
import { AoiManager } from "./classes/AoiManager";
import { DataFunction } from "./classes/AoiTyping";
import { LibDataFunction } from "./classes/AoiTyping";
import { type Context as EventContext } from "telegramsjs";
import { AoijsError, AoiStopping, MessageError } from "./classes/AoiError";

function getStopping(name: string) {
  switch (name) {
    case "$onlyIf":
    case "$cooldown":
    case "$argsCheck":
    case "$onlyPerms":
    case "$onlyForIDs":
    case "$chatCooldown":
    case "$globalCooldown":
    case "$onlyClientPerms":
    case "$onlyIfMessageContains":
      return true;
    default:
      return false;
  }
}

/**
 * Represents the runtime environment for executing scripts.
 */
class Runtime {
  globalEnvironment = new Environment();
  private contexts = new Map<string, Context>();
  private evaluator = new Evaluator();
  database: AoiManager;
  customFunction: DataFunction[] = [];
  functionsArray: LibDataFunction[] = [];
  varReplaceOption: boolean = false;

  /**
   * Constructs a new Runtime instance with a Telegram context.
   * @param eventData - The Telegram context for the runtime.
   * @param database - The local database.
   * @param customFunction - An array of customFunction functions.
   * @param options.varReplaceOption - Compilation of &localVar& variables.
   * @param options.functionsArray - An array to store processed data functions.
   */
  constructor(
    eventData: EventContext & { telegram: AoiClient },
    database: AoiManager,
    customFunction: DataFunction[],
    varReplaceOption: boolean,
    functionsArray: LibDataFunction[],
  ) {
    this.database = database;
    this.customFunction = customFunction;
    this.varReplaceOption = varReplaceOption;
    this.functionsArray = functionsArray;
    this.prepareGlobal(eventData, database, customFunction, functionsArray);
  }

  /**
   * Runs the input script and returns the result.
   * @param fileName - The name of the script file.
   * @param input - The script code to execute.
   */
  runInput(fileName: string | { event: string }, input: string) {
    const abstractSyntaxTree = new Parser().parseToAst(
      new Lexer(input).main(),
      this,
    );
    const context = this.prepareContext(fileName);
    return this.evaluator.visitArgument(abstractSyntaxTree, context);
  }

  /**
   * Prepares a new execution context for a script.
   * @param fileName - The name of the script file.
   */
  prepareContext(fileName: string | { event: string }) {
    const environment = new Environment(this.globalEnvironment);
    const eventType = typeof fileName === "string" ? "command" : "event";
    const executionContext = new Context(
      fileName,
      environment,
      this,
      eventType,
      this.varReplaceOption,
    );
    const scriptName =
      typeof fileName === "string" ? fileName : fileName?.event;
    this.contexts.set(scriptName, executionContext);
    return executionContext;
  }

  /**
   * Retrieves the execution context for a specific script.
   * @param fileName - The name of the script file.
   */
  getContext(fileName: string | { event: string }) {
    const scriptName =
      typeof fileName === "string" ? fileName : fileName?.event;
    return this.contexts.get(scriptName);
  }

  /**
   * Prepares the global environment for custom functions by reading functions in a directory and from custom plugins.
   * @param eventData - The Telegram context.
   * @param database - The local database.
   * @param customFunction - An array of custom function definitions.
   * @param functionsArray - An array to store processed data functions.
   */
  private prepareGlobal(
    eventData: EventContext & { telegram: AoiClient },
    database: AoiManager,
    customFunction: DataFunction[],
    functionsArray: LibDataFunction[],
  ) {
    readFunctionsInLib(
      functionsArray,
      this.globalEnvironment,
      eventData,
      database,
    );
    if (Array.isArray(customFunction)) {
      readFunctions(
        customFunction,
        this.globalEnvironment,
        eventData,
        database,
        this,
      );
    }
  }
}

/**
 * Runs Aoi code using a Runtime instance.
 * @param command - The command or event data for the code execution.
 * @param code - The Aoi code to execute.
 * @param eventData - The Telegram context.
 * @param runtime - The Runtime instance.
 */
async function evaluateAoiCommand(
  command: string | { event: string },
  code: string,
  eventData: EventContext & { telegram: AoiClient },
  runtime: Runtime,
) {
  try {
    const aoiRuntime = new Runtime(
      eventData,
      runtime.database,
      runtime.customFunction,
      runtime.varReplaceOption,
      runtime.functionsArray,
    );
    return await aoiRuntime.runInput(command, code);
  } catch (error) {
    if (!(error instanceof AoiStopping)) throw error;
  }
}

/**
 * Replaces placeholders in an input string with values from arrays.
 * @param inputString - The input string containing placeholders.
 * @param array - The array of placeholders to be replaced.
 * @param arrayParams - The array of values to replace placeholders with.
 * @returns - The updated string with replaced values.
 */
function updateParamsFromArray(
  inputString: string,
  array: string[],
  arrayParams: string[],
) {
  arrayParams = [
    ...arrayParams,
    ...Array(array.length - arrayParams.length).fill(undefined),
  ];
  for (let i = 0; i < array.length; i++) {
    const regex = new RegExp(`{${array[i]}}`, "g");
    inputString = inputString.replace(regex, arrayParams[i]);
  }
  return inputString;
}

/**
 * Reads and initializes custom functions and adds them to the parent global environment.
 * @param customFunction - An array of custom function definitions.
 * @param parent - The global environment where functions will be added.
 * @param eventData - The Telegram context.
 * @param database - The local database.
 * @param runtime - The Runtime instance.
 */
function readFunctions(
  customFunction: DataFunction[],
  parent: Runtime["globalEnvironment"],
  eventData: EventContext & { telegram: AoiClient },
  database: AoiManager,
  runtime: Runtime,
) {
  for (const dataFunction of customFunction) {
    const dataFunctionName = dataFunction?.name.toLowerCase();
    if (!dataFunctionName?.startsWith("$")) {
      throw new AoijsError(
        "customFunction",
        "the function name should begin with the symbol $",
      );
    }
    if (dataFunction.type === "js" || !dataFunction.type) {
      parent.set(dataFunctionName, async (context) => {
        const error = new MessageError(eventData, context);
        if (!dataFunction.callback) {
          throw new AoijsError(
            "customFunction",
            "you specified the type as 'js', so to describe the actions of this function, the 'callback' parameter is required",
            context.fileName,
            dataFunction.name,
          );
        }
        if (typeof dataFunction.callback === "function") {
          const response = await dataFunction.callback(
            context,
            eventData,
            database,
            error,
          );
          if (context.stopping) {
            throw new AoiStopping(dataFunction.name);
          }
          return response;
        } else if (typeof dataFunction.callback === "string") {
          return dataFunction.callback;
        } else {
          throw new AoijsError(
            "customFunction",
            "the 'callback' should be either a function or a string",
          );
        }
      });
    } else if (dataFunction.type === "aoitelegram") {
      parent.set(dataFunctionName, async (context) => {
        if (!dataFunction.code) {
          throw new AoijsError(
            "customFunction",
            "you specified the type as 'aoitelegram', so to describe the actions of this function, the 'code' parameter is required",
            context.fileName,
            dataFunction.name,
          );
        }
        const params = await context.getEvaluateArgs();
        const dataFunctionCode = updateParamsFromArray(
          dataFunction.code,
          dataFunction.params ?? [],
          params as string[],
        );
        const response = await evaluateAoiCommand(
          context.fileName,
          dataFunctionCode,
          eventData,
          runtime,
        );
        return response;
      });
    } else {
      throw new AoijsError(
        "customFunction",
        "the specified parameters for creating a custom function do not match the requirements",
        undefined,
        dataFunction.name,
      );
    }
  }
}

/**
 * Reads and processes functions in a library, setting them up as commands in a specified parent.
 *
 * @param functionsArray - An array of functions to be processed.
 * @param parent - The object where processed functions will be added as commands.
 * @param eventData - Data related to the event triggering the functions.
 * @param database - The database object for function interactions.
 */
function readFunctionsInLib(
  functionsArray: LibDataFunction[],
  parent: Runtime["globalEnvironment"],
  eventData: EventContext & { telegram: AoiClient },
  database: AoiManager,
) {
  const processRutime = (libFunction: LibDataFunction) => {
    const dataFunctionName = libFunction.name.toLowerCase();

    parent.set(dataFunctionName, async (context) => {
      const error = new MessageError(eventData, context);
      let response;

      try {
        response = await libFunction.callback(
          context,
          eventData,
          database,
          error,
        );
      } catch (err) {
        if (err instanceof AoiStopping) return;

        const errorMessage = `${err}`.split(":")?.[1].trimStart() || err;
        const suppressErrors = context.suppressErrors;
        if (`${suppressErrors}` !== "undefined" && eventData?.send) {
          eventData.send(`${suppressErrors}`, { parse_mode: "HTML" });
        } else if (eventData.telegram?.functionError) {
          eventData.telegram.addFunction({
            name: "$handleError",
            callback: async (
              ctx: Context,
              event: EventContext & { telegram: AoiClient },
              database: AoiManager,
              error: MessageError,
            ) => {
              const [property = "error"] = await ctx.getEvaluateArgs();
              ctx.checkArgumentTypes([property as string], error, ["string"]);

              const dataError = {
                error: errorMessage,
                function: dataFunctionName,
                command: context.fileName,
                event:
                  typeof context.fileName === "object"
                    ? context.fileName.event
                    : undefined,
              } as { [key: string]: string | undefined };

              return dataError[property as string] || dataError;
            },
          });
          eventData.telegram.emit("functionError", context, eventData);
          eventData.telegram.removeFunction("$handleError");
        } else if (eventData.telegram?.sendMessageError) {
          error.customError(
            `Failed to usage ${dataFunctionName}: ${errorMessage}`,
            dataFunctionName,
          );
        }
      }
      if (getStopping(libFunction.name) && response) {
        throw new AoiStopping(libFunction.name);
      }

      return response;
    });
  };

  functionsArray.forEach(processRutime);
}

export { Runtime };
