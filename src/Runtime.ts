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

class Runtime {
  global = new Environment();
  #contexts = new Map<string, Context>();
  #evaluator = Evaluator.singleton;
  options: RuntimeOptions = {
    alwaysStrict: false,
    trimOutput: true,
  };
  telegram: any;
  constructor(telegram: any) {
    this.#_prepareGlobal(telegram);
  }

  runInput(fileName: string, input: string) {
    const ast = new Parser().parseToAst(
      /* Tokens */ new Lexer(input).main(),
      this,
    );
    const ctx = this.prepareContext(fileName);
    return this.#evaluator.evaluate(ast, ctx);
  }

  prepareContext(fileName: string) {
    let env = new Environment(this.global);
    let bag = new RuntimeBag();
    let ctx = new Context(fileName, bag, env, this);
    this.#contexts.set(fileName, ctx);

    return ctx;
  }

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
