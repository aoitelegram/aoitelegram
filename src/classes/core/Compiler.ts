import { AoijsTypeError } from "../AoiError";
import { ParserFunction } from "./ParserFunction";
import { Collection } from "@telegram.ts/collection";
import type { CustomJSFunction } from "../AoiTyping";

class Compiler {
  code: string;
  reverseFunctions?: boolean;
  availableFunctions: Collection<string, CustomJSFunction>;
  functionCounts: Collection<string, number> = new Collection();

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

  processFunctionNames() {
    this.availableFunctions.forEach((func, name) => {
      this.code = this.code.replace(new RegExp(`\\${name}`, "gi"), (search) => {
        const lowerCaseName = name.toLowerCase();
        const counts = this.functionCounts.get(lowerCaseName) || 1;
        const functionNameWithCount = `${lowerCaseName}:${counts}:`;
        this.functionCounts.set(lowerCaseName, counts + 1);
        return functionNameWithCount;
      });
    });
  }

  compile() {
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
        this.code.split(new RegExp(`\\${matches}`, "gm")).at(-1) || "";

      if (
        dataFunction.brackets &&
        dataFunction.fields?.[0].required &&
        !segmentCode.startsWith("[")
      ) {
        throwBracketError(dataFunction, this.code, "brackets");
      }

      if (
        dataFunction.brackets &&
        segmentCode.startsWith("[") &&
        !segmentCode.includes("]")
      ) {
        throwBracketError(dataFunction, this.code, "bracket closing");
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
        const overloads = func.overloadsFor(parsedFunctions);
        if (overloads.length) {
          for (const overload of overloads) {
            func.addOverload(overload);
            processedIds.push(overload.id);
          }
        }
      } else {
        const overloads = func.overloadsFor(parsedFunctions);
        if (overloads.length) {
          for (const overload of overloads) {
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

  replaceLast(content: string, search: string, toReplace: string) {
    let splits = content.split(search);
    content = splits.pop()!;
    return splits.join(search) + toReplace + content;
  }

  escapeCode(content: string) {
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

  unescapeCode(content: string) {
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

function throwBracketError(
  func: CustomJSFunction,
  code: string,
  errorType: string,
): never {
  const errorMessage = `${func.name}`;
  const pointer = " ".repeat(7) + "^".repeat(func.name.length);
  const lines = code.split(/\n/g);
  let lineNumber = lines.findIndex((line) => line.includes(func.name)) + 1;
  const lastIndexOfFunc =
    lineNumber !== 0 ? lines[lineNumber - 1].lastIndexOf(func.name) : "unknown";

  const errorLine =
    typeof lastIndexOfFunc !== "number" ? lastIndexOfFunc : lastIndexOfFunc + 1;

  throw new AoijsTypeError(
    `${errorMessage}\n${pointer} this function requires ${errorType} at line ${lineNumber}:${errorLine}.`,
  );
}

export { Compiler };
