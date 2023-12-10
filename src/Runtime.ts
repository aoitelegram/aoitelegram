import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Context } from "./Context";
import { Evaluator } from "./Evaluator";
import { Environment } from "./Environment";
import { Lexer, TokenArgument, TokenOperator } from "./Lexer";
import { Parser } from "./Parser";
import { AoijsError, AoiStopping, MessageError } from "./classes/AoiError";
import { AoiManager } from "./classes/AoiManager";
import { DataFunction } from "./classes/AoiBase";
import { TelegramBot, type Context as EventContext } from "telegramsjs";
import { UserFromGetMe } from "@telegram.ts/types";

interface RuntimeOptions {
  alwaysStrict: boolean;
  trimOutput: boolean;
}

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
  private evaluator = Evaluator.singleton;
  options: RuntimeOptions = {
    alwaysStrict: false,
    trimOutput: false,
  };
  database: AoiManager;
  customFunction: DataFunction[];
  disableFunctions: string[];
  varReplaceOption: boolean;

  /**
   * Constructs a new Runtime instance with a Telegram context.
   * @param eventData - The Telegram context for the runtime.
   * @param database - The local database.
   * @param customFunction - An array of customFunction functions.
   * @param options.disableFunctions - Functions that will be removed from the library's loading functions.
   * @param options.varReplaceOption - Compilation of # variables.
   */
  constructor(
    eventData: EventContext["telegram"],
    database: AoiManager,
    customFunction?: DataFunction[],
    disableFunctions?: string[],
    varReplaceOption?: boolean,
  ) {
    this.database = database;
    this.customFunction = customFunction || [];
    this.disableFunctions = disableFunctions || [];
    this.varReplaceOption = varReplaceOption || false;
    this.prepareGlobal(eventData, database, customFunction, disableFunctions);
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
    return this.evaluator.evaluate(abstractSyntaxTree, context);
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
   * @param disableFunctions - Functions that will be removed from the library's loading functions.
   */
  private prepareGlobal(
    eventData: EventContext["telegram"],
    database: AoiManager,
    customFunction?: DataFunction[],
    disableFunctions?: string[],
  ) {
    readFunctionsInDirectory(
      path.join(__dirname, "/function/"),
      this.globalEnvironment,
      eventData,
      database,
      disableFunctions || [],
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
function evaluateAoiCommand(
  command: string | { event: string },
  code: string,
  eventData: (TelegramBot & EventContext) | UserFromGetMe,
  runtime: Runtime,
) {
  try {
    const aoiRuntime = new Runtime(
      eventData,
      runtime.database,
      runtime?.customFunction,
      runtime?.disableFunctions,
    );
    return aoiRuntime.runInput(command, code);
  } catch (error) {
    if (!(error instanceof AoiStopping)) throw error;
  }
}

/**
 * Replaces placeholders in an input string with values from arrays.
 * @param {string} inputString - The input string containing placeholders.
 * @param {string[]} array - The array of placeholders to be replaced.
 * @param {string[]} arrayParams - The array of values to replace placeholders with.
 * @returns {string} - The updated string with replaced values.
 */
function updateParamsFromArray(
  inputString: string,
  array: string[],
  arrayParams: string[],
): string {
  arrayParams.forEach((value: string, index: number) => {
    const placeholder = `{${array[index]}}`;
    const regex = new RegExp(placeholder, "g");
    array.forEach((valueArgs: string, indexArgs: number) => {
      inputString = inputString.replace(regex, value);
    });
  });
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
  eventData: EventContext["telegram"],
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
        const error = new MessageError(eventData);
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
        const params = await context.evaluateArgs(context.getArgs());
        dataFunction.code = updateParamsFromArray(
          dataFunction.code,
          dataFunction.params ?? [],
          params as string[],
        );
        const response = await evaluateAoiCommand(
          context.fileName,
          dataFunction.code,
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
 * Recursively reads and initializes functions in a directory and adds them to the parent global environment.
 * @param dirPath - The directory path to search for functions.
 * @param parent - The global environment where functions will be added.
 * @param eventData - The Telegram context.
 * @param database - The local database.
 * @param disableFunctions - Functions that will be removed from the library's loading functions.
 */
function readFunctionsInDirectory(
  dirPath: string,
  parent: Runtime["globalEnvironment"],
  eventData: EventContext["telegram"],
  database: AoiManager,
  disableFunctions: string[],
) {
  const disableFunctionsSet = new Set(
    disableFunctions.map((func) => func.toLowerCase()),
  );

  const processFile = (itemPath: string) => {
    delete require.cache[itemPath];
    const dataFunction = require(itemPath).default;
    if (!dataFunction?.name) return;
    const dataFunctionName = dataFunction.name.toLowerCase();
    if (disableFunctionsSet.has(dataFunctionName)) return;

    if (dataFunction && typeof dataFunction.callback === "function") {
      parent.set(dataFunctionName, async (context) => {
        const error = new MessageError(eventData);
        let response;

        try {
          response = await dataFunction.callback(
            context,
            eventData,
            database,
            error,
          );
        } catch (err) {
          if (err instanceof AoiStopping) return;

          const errorMessage = `${err}`.split(":")?.[1].trimStart() || err;

          if (eventData.telegram?.functionError) {
            eventData.telegram.addFunction({
              name: "$handleError",
              callback: async (
                ctx: Context,
                event: EventContext["telegram"],
                database: AoiManager,
                error: MessageError,
              ) => {
                const [property = "error"] = await ctx.getEvaluateArgs();
                ctx.checkArgumentTypes([property as string], error, ["string"]);

                const dataError = {
                  error: errorMessage,
                  function: dataFunctionName,
                  command: context.fileName,
                } as { [key: string]: unknown };

                return dataError[property as string] ?? dataError;
              },
            });
            eventData.telegram.emit("functionError", context, eventData);
            eventData.telegram.removeFunction("$handleError");
          }

          if (eventData.telegram?.sendMessageError) {
            error.customError(
              `Failed to usage ${dataFunctionName}: ${errorMessage}`,
              dataFunctionName,
            );
          }
        }

        if (getStopping(dataFunction.name) && response) {
          throw new AoiStopping(dataFunction.name);
        }

        return response;
      });
    }
  };

  const processItem = (item: string) => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      readFunctionsInDirectory(
        itemPath,
        parent,
        eventData,
        database,
        disableFunctions,
      );
    } else if (itemPath.endsWith(".js")) {
      processFile(itemPath);
    }
  };

  const items = fs.readdirSync(dirPath);
  items.forEach(processItem);
}

export { Runtime, RuntimeOptions };
