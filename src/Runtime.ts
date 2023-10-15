import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Context } from "./Context";
import { Environment } from "./Environment";
import { Evaluator } from "./Evaluator";
import { Lexer, TokenArgument, TokenOperator } from "./Lexer";
import { Parser } from "./Parser";
import { RuntimeBag } from "./RuntimeBag";

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
  telegram: any;

  /**
   * Constructs a new Runtime instance with a Telegram context.
   * @param telegram - The Telegram context for the runtime.
   */
  constructor(telegram: any) {
    this.#_prepareGlobal(telegram);
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

  #_prepareGlobal(telegram: any) {
    readFunctionsInDirectory(
      __dirname.replace("classes", "function"),
      this.global,
      telegram,
    );
  }
}

function readFunctionsInDirectory(
  dirPath: string,
  parent: Runtime["global"],
  telegram: any,
) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      readFunctionsInDirectory(itemPath, parent, telegram);
    } else if (itemPath.endsWith(".js")) {
      const r = require(itemPath).data;
      if (r) {
        parent.set(r.name, (ctx) => r.callback(ctx, telegram));
      }
    }
  }
}

export { Runtime, RuntimeOptions };
