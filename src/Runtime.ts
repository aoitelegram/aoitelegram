import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Context } from "./Context";
import { Environment } from "./Environment";
import { Evaluator } from "./Evaluator";
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
      return true;
    case "$cooldown":
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
  customFunction?: DataFunction[];
  disableFunctions?: string[];

  /**
   * Constructs a new Runtime instance with a Telegram context.
   * @param telegram - The Telegram context for the runtime.
   * @param database - The local database.
   * @param customFunction - An array of customFunction functions.
   * @param options.disableFunctions - Functions that will be removed from the library's loading functions.
   */
  constructor(
    telegram: EventContext["telegram"],
    database: AoiManager,
    customFunction?: DataFunction[],
    disableFunctions?: string[],
  ) {
    this.database = database;
    this.customFunction = customFunction || [];
    this.disableFunctions = disableFunctions || [];
    this.prepareGlobal(telegram, database, customFunction, disableFunctions);
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
   * @param telegram - The Telegram context.
   * @param database - The local database.
   * @param customFunction - An array of custom function definitions.
   * @param disableFunctions - Functions that will be removed from the library's loading functions.
   */
  private prepareGlobal(
    telegram: EventContext["telegram"],
    database: AoiManager,
    customFunction?: DataFunction[],
    disableFunctions?: string[],
  ) {
    readFunctionsInDirectory(
      __dirname.replace("classes", "function"),
      this.globalEnvironment,
      telegram,
      database,
      disableFunctions || [],
    );
    if (Array.isArray(customFunction)) {
      readFunctions(
        customFunction,
        this.globalEnvironment,
        telegram,
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
 * @param telegram - The Telegram context.
 * @param runtime - The Runtime instance.
 */
async function evaluateAoiCommand(
  command: string | { event: string },
  code: string,
  telegram: (TelegramBot & EventContext) | UserFromGetMe,
  runtime: Runtime,
) {
  try {
    const aoiRuntime = new Runtime(
      telegram,
      runtime.database,
      runtime?.customFunction,
      runtime?.disableFunctions,
    );
    return await aoiRuntime.runInput(command, code);
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
 * @param telegram - The Telegram context.
 * @param database - The local database.
 * @param runtime - The Runtime instance.
 */
function readFunctions(
  customFunction: DataFunction[],
  parent: Runtime["globalEnvironment"],
  telegram: EventContext["telegram"],
  database: AoiManager,
  runtime: Runtime,
) {
  for (const dataFunction of customFunction) {
    const dataFunctionName = dataFunction?.name.toLowerCase();
    if (
      dataFunctionName &&
      (dataFunction.type === "js" || !dataFunction.type)
    ) {
      parent.set(dataFunctionName, async (context) => {
        const error = new MessageError(telegram);
        if (!dataFunction.callback) {
          throw new AoijsError(
            "runtime",
            "you specified the type as 'js', so to describe the actions of this function, the 'callback' parameter is required",
            context.fileName,
            dataFunction.name,
          );
        }
        if (typeof dataFunction.callback === "function") {
          const response = await dataFunction.callback(
            context,
            telegram,
            database,
            error,
          );
          return response;
        } else if (typeof dataFunction.callback === "string") {
          return dataFunction.callback;
        } else {
          throw new AoijsError(
            "runtime",
            "the 'callback' should be either a function or a string",
          );
        }
      });
    } else if (dataFunctionName && dataFunction.type === "aoitelegram") {
      parent.set(dataFunctionName, async (context) => {
        if (!dataFunction.code) {
          throw new AoijsError(
            "runtime",
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
          telegram,
          runtime,
        );
        return response;
      });
    } else {
      throw new AoijsError(
        "runtime",
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
 * @param telegram - The Telegram context.
 * @param database - The local database.
 * @param disableFunctions - Functions that will be removed from the library's loading functions.
 */
function readFunctionsInDirectory(
  dirPath: string,
  parent: Runtime["globalEnvironment"],
  telegram: EventContext["telegram"],
  database: AoiManager,
  disableFunctions: string[],
) {
  const items = fs.readdirSync(dirPath);
  const disableFunctionsSet = new Set(
    disableFunctions.map((func) => func.toLowerCase()),
  );
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      readFunctionsInDirectory(
        itemPath,
        parent,
        telegram,
        database,
        disableFunctions,
      );
    } else if (itemPath.endsWith(".js")) {
      const dataFunction = require(itemPath).default;
      if (!dataFunction?.name) continue;
      const dataFunctionName = dataFunction.name.toLowerCase();
      if (disableFunctionsSet.has(dataFunctionName)) continue;
      if (dataFunction && typeof dataFunction.callback === "function") {
        parent.set(dataFunctionName, async (context) => {
          const error = new MessageError(telegram);
          let response;
          try {
            response = await dataFunction.callback(
              context,
              telegram,
              database,
              error,
            );
          } catch (err) {
            if (err instanceof AoiStopping) return;
            const errorMessage = `${err}`.split(":")?.[1].trimStart() || err;
            error.customError(
              `Failed to usage ${dataFunctionName}: ${errorMessage}`,
              dataFunctionName,
            );
          }
          if (getStopping(dataFunction.name) && response) {
            throw new AoiStopping(dataFunction.name);
          }
          return response;
        });
      }
    }
  }
}

export { Runtime, RuntimeOptions };
