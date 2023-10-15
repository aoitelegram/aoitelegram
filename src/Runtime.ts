import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Context } from "./Context";
import { Environment } from "./Environment";
import { Evaluator } from "./Evaluator";
import { Lexer, TokenArgument, TokenOperator } from "./Lexer";
import { Parser } from "./Parser";
import { RuntimeBag } from "./RuntimeBag";
import { MessageError } from "./classes/AoiError";
import { AoiManager } from "./classes/AoiManager";

interface RuntimeOptions {
  alwaysStrict: boolean;
  trimOutput: boolean;
}

/**
 * Represents the runtime environment for executing scripts.
 */
class Runtime {
  global = new Environment();
  #contexts = new Map<string, Context>();
  #evaluator = Evaluator.singleton;
  options: RuntimeOptions = {
    alwaysStrict: false,
    trimOutput: true,
  };

  /**
   * Constructs a new Runtime instance with a Telegram context.
   * @param {any} telegram - The Telegram context for the runtime.
   * @param {AoiManager} database - The local database.
   */
  constructor(telegram: any, database: AoiManager) {
    this.#_prepareGlobal(telegram, database);
  }

  /**
   * Runs the input script and returns the result.
   * @param fileName - The name of the script file.
   * @param input - The script code to execute.
   */
  runInput(fileName: string, input: string) {
    const ast = new Parser().parseToAst(
      /* Tokens */ new Lexer(input).main(),
      this,
    );
    const ctx = this.prepareContext(fileName);
    return this.#evaluator.evaluate(ast, ctx);
  }

  /**
   * Prepares a new execution context for a script.
   * @param fileName - The name of the script file.
   */
  prepareContext(fileName: string) {
    let env = new Environment(this.global);
    let bag = new RuntimeBag();
    let ctx = new Context(fileName, bag, env, this);
    this.#contexts.set(fileName, ctx);
    return ctx;
  }

  /**
   * Retrieves the execution context for a specific script.
   * @param fileName - The name of the script file.
   */
  getContext(fileName: string) {
    return this.#contexts.get(fileName);
  }

  #_prepareGlobal(telegram: any, database: AoiManager) {
    readFunctionsInDirectory(
      __dirname.replace("classes", "function"),
      this.global,
      telegram,
      database,
    );
  }
}

function readFunctionsInDirectory(
  dirPath: string,
  parent: Runtime["global"],
  telegram: any,
  database: AoiManager,
) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      readFunctionsInDirectory(itemPath, parent, telegram, database);
    } else if (itemPath.endsWith(".js")) {
      const dataFunc = require(itemPath).data;
      if (dataFunc) {
        parent.set(dataFunc.name, async (ctx) => {
          const error = new MessageError(telegram);
          return await dataFunc.callback(ctx, telegram, database, error);
        });
      }
    }
  }
}

export { Runtime, RuntimeOptions };
