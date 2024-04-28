import { AoijsTypeError } from "../AoiError";
import { ParserFunction } from "./ParserFunction";
import { Collection } from "@telegram.ts/collection";
import type { CustomJSFunction } from "../AoiTyping";

interface SuccessCompiler {
  code: string;
  functions: ParserFunction[];
}

interface ErrorCompiler {
  func: string;
  line: number;
  errorCode: string;
  description: string;
}

class Compiler {
  public code: string;
  public readonly reverseFunctions?: boolean;
  public readonly availableFunctions: Collection<string, CustomJSFunction>;
  public readonly functionCounts: Collection<string, number> = new Collection();

  constructor(parameters: {
    code: string;
    reverseFunctions?: boolean;
    availableFunctions: Collection<string, CustomJSFunction>;
  }) {
    this.code = parameters.code;
    this.reverseFunctions = parameters.reverseFunctions;
    this.availableFunctions = parameters.availableFunctions;
    this.processFunctionNames();
  }

  processFunctionNames(): void {
    for (const [name, func] of this.availableFunctions) {
      if (!func.aliases) continue;
      func.aliases.forEach((name: string) => {
        delete func["aliases"];
        this.availableFunctions.set(name, func);
      });
    }
    for (const [name, func] of this.availableFunctions) {
      this.code = this.code.replace(new RegExp(`\\${name}`, "gi"), (search) => {
        const lowerCaseName = name.toLowerCase();
        const counts = this.functionCounts.get(lowerCaseName) || 1;
        const functionNameWithCount = `${lowerCaseName}:${counts}:`;
        this.functionCounts.set(lowerCaseName, counts + 1);
        return functionNameWithCount;
      });
    }
  }

  compile(): SuccessCompiler | ErrorCompiler {
    const parsedFunctions: ParserFunction[] = [];
    const functionRegExp = new RegExp(
      `(${this.availableFunctions
        .keyArray()
        .map((name) => `\\${name}:\\d+:`)
        .join("|")})`,
      "g",
    );

    const segments = this.code.split(/\$/g).reverse();
    for (const segment of segments) {
      const matches = `$${segment}`.match(functionRegExp) || [];
      const functionName = matches?.[0]?.split(":")[0];
      if (!functionName || !this.availableFunctions.has(`${functionName}`))
        continue;

      const dataFunction = this.availableFunctions.get(`${functionName}`)!;
      dataFunction.name = `${matches}`;

      const parserFunction = new ParserFunction(dataFunction);
      const segmentCode =
        this.code.split(new RegExp(`\\${matches}`, "gm")).pop() || "";

      if (
        dataFunction.brackets &&
        dataFunction.fields?.[0].required &&
        !segmentCode.startsWith("[")
      ) {
        return searchBracketError(dataFunction.name, this.code, "brackets");
      }

      if (
        dataFunction.brackets &&
        segmentCode.startsWith("[") &&
        !segmentCode.includes("]")
      ) {
        return searchBracketError(
          dataFunction.name,
          this.code,
          "bracket closing",
        );
      }

      if (segmentCode.startsWith("[")) {
        const fields = segmentCode.slice(1).split(/\]/)[0].split(":")[0];
        parserFunction.raw = fields;
        parserFunction.setInside(this.unescapeCode(fields));
        parserFunction.setFields(
          fields.split(";").map((field) => this.unescapeCode(field)),
        );
      }

      this.code = this.replaceLast(
        this.code,
        parserFunction.rawTotal,
        parserFunction.id,
      );
      parsedFunctions.push(parserFunction);
    }

    const processedIds: string[] = [];
    const loadedFunctions: ParserFunction[] = [];

    for (const func of parsedFunctions.reverse()) {
      if (processedIds.includes(func.id)) {
        const overloads = func.filterFunctions(parsedFunctions);
        if (overloads.length) {
          for (const overload of this.reverseFunctions
            ? overloads.reverse()
            : overloads) {
            func.addOverload(overload);
            processedIds.push(overload.id);
          }
        }
      } else {
        const overloads = func.filterFunctions(parsedFunctions);
        if (overloads.length) {
          for (const overload of this.reverseFunctions
            ? overloads.reverse()
            : overloads) {
            func.addOverload(overload);
            processedIds.push(overload.id);
          }
          loadedFunctions.push(func);
        } else {
          loadedFunctions.push(func);
        }
      }
    }

    return {
      code: this.unescapeCode(this.code),
      functions: this.reverseFunctions
        ? loadedFunctions.reverse()
        : loadedFunctions,
    };
  }

  replaceLast(content: string, search: string, toReplace: string): string {
    let splits = content.split(search);
    content = splits.pop()!;
    return splits.join(search) + toReplace + content;
  }

  escapeCode(content: string): string {
    return content
      .split("\\[")
      .join("{#REPLACED_BRACKET_RIGHT#}")
      .split("\\]")
      .join("{#REPLACED_BRACKET_LEFT#}")
      .split("\\$")
      .join("{#REPLACED_DOLLAR_SIGN#}")
      .split("\\;")
      .join("{#REPLACED_SEMICOLON_SIGN#}");
  }

  unescapeCode(content: string): string {
    return content
      .split("{#REPLACED_BRACKET_RIGHT#}")
      .join("[")
      .split("{#REPLACED_BRACKET_LEFT#}")
      .join("]")
      .split("{#REPLACED_DOLLAR_SIGN#}")
      .join("$")
      .split("{#REPLACED_SEMICOLON_SIGN#}")
      .join(";");
  }
}

function searchBracketError(
  func: string,
  code: string,
  errorType: string,
): { func: string; line: number; errorCode: string; description: string } {
  const lines = code.split(/\n/g);
  const lineNumber = lines.findIndex((line) => line.includes(func)) + 1;
  const errorLine = lineNumber ? lines[lineNumber - 1].lastIndexOf(func) : 0;

  return {
    func,
    line: errorLine,
    errorCode: lines[errorLine],
    description: `this function requires ${errorType} at line ${lineNumber}:${errorLine}`,
  };
}

export { Compiler, SuccessCompiler, ErrorCompiler };
