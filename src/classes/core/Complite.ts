import { Context } from "./Context";
import { AoijsTypeError } from "../AoiError";
import type { ICommandsOptions } from "../AoiBase";
import { Collection } from "@telegram.ts/collection";
import type { DataFunction } from "../AoiTyping";

class Complite<TArray extends any[]> {
  code: string;
  command: ICommandsOptions;
  availableFunctions: Collection<string, DataFunction>;
  escapedCode: { code: string; functions: Collection<string, Context> };

  constructor(
    code: string,
    command: ICommandsOptions,
    availableFunctions: Collection<string, DataFunction>,
  ) {
    this.code = code;
    this.command = command;
    this.availableFunctions = availableFunctions;
    this.escapedCode = { code, functions: new Collection() };
  }

  compile() {
    this.extractFunctions();
    this.processFunctions();
    return this.escapedCode;
  }

  extractFunctions() {
    for (const func of this.code.split(/\$/g).slice(1).reverse()) {
      const textMatch = `$${func}`.match(
        new RegExp(
          `(${this.availableFunctions
            .keyArray()
            .map((name) => `\\${name}`)
            .join("|")})`,
          "g",
        ),
      );

      if (!textMatch) continue;

      const functionSearch = this.availableFunctions.find(
        ({ name }) => textMatch[0] === name.toLowerCase(),
      );

      if (functionSearch) {
        const callFunction = new Context<TArray>(functionSearch);
        const searchString = `\\${functionSearch.name}`;
        const codeSegment = this.escapedCode.code
          .split(new RegExp(`\\${functionSearch.name}`, "gm"))
          .find((el, index, array) => array.length === index + 1);

        if (functionSearch.brackets && !codeSegment?.startsWith("[")) {
          throwBracketError(
            functionSearch,
            this.escapedCode.code,
            "brackets",
            this.command,
          );
        }

        if (
          functionSearch.brackets &&
          codeSegment?.startsWith("[") &&
          !codeSegment.includes("]")
        ) {
          throwBracketError(
            functionSearch,
            this.escapedCode.code,
            "bracket closing",
            this.command,
          );
        }

        const insideBrackets = codeSegment?.startsWith("[")
          ? codeSegment.slice(1).split(/\]/)[0]
          : undefined;

        if (insideBrackets !== undefined) {
          callFunction.total = insideBrackets;
          callFunction.setInside(insideBrackets);
          callFunction.setFields(insideBrackets.split(";"));
        }

        this.escapedCode.code = this.replaceLast(
          this.escapedCode.code,
          callFunction.total,
          callFunction.id,
        );
        this.escapedCode.functions.set(functionSearch.name, callFunction);
      }
    }
  }

  processFunctions() {
    const loadedFunctions: Context<TArray>[] = [];
    const processedFunctionIds: string[] = [];

    for (const [, currentFunction] of this.escapedCode.functions.toReversed()) {
      if (processedFunctionIds.includes(currentFunction.id)) {
        const currentUnderFunction = currentFunction.underFunctionsFor(
          this.escapedCode.functions,
        );
        if (currentUnderFunction.length) {
          for (const under of currentUnderFunction) {
            currentFunction.addUnderFunctions(under);
            processedFunctionIds.push(under.id);
          }
        }
      } else {
        const currentUnderFunction = currentFunction.underFunctionsFor(
          this.escapedCode.functions,
        );
        if (currentUnderFunction.length) {
          for (const under of currentUnderFunction) {
            currentFunction.addUnderFunctions(under);
            processedFunctionIds.push(under.id);
          }
          loadedFunctions.push(currentFunction);
        } else {
          loadedFunctions.push(currentFunction);
        }
      }
    }
  }

  replaceLast(code: string, search: string, replace: string): string {
    let parts = code.split(search);
    return parts.join(search) + replace + parts.pop();
  }
}

function throwBracketError(
  func: DataFunction,
  code: string,
  errorType: string,
  command?: ICommandsOptions,
): never {
  const errorMessage = `${func.name}`;
  const pointer = " ".repeat(7) + "^".repeat(func.name.length);
  const lines = unescape(code).split(/\n/g);
  let lineNumber = lines.findIndex((line) => line.includes(func.name)) + 1;
  const lastIndexOfFunc =
    lineNumber !== 0 ? lines[lineNumber - 1].lastIndexOf(func.name) : "unknown";

  throw new AoijsTypeError(
    `${errorMessage}\n${pointer} this function requires ${errorType} at line ${lineNumber}:${typeof lastIndexOfFunc !== "number" ? lastIndexOfFunc : lastIndexOfFunc + 1}${command ? ` for command ${JSON.stringify(command)}` : ""}.`,
  );
}

export { Complite };
