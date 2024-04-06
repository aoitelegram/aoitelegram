import { AoijsTypeError } from "../AoiError";
import { ParserFunction } from "./ParserFunction";
import type { CustomJSFunction } from "../AoiTyping";
import type { Collection } from "@telegram.ts/collection";

class Complite {
  code: string;
  checkBrackets?: boolean;
  reverseFunctions?: boolean;
  availableFunctions: Collection<string, CustomJSFunction>;

  constructor(parameters: {
    code: string;
    checkBrackets?: boolean;
    reverseFunctions?: boolean;
    availableFunctions: Collection<string, CustomJSFunction>;
  }) {
    this.code = parameters.code;
    this.checkBrackets = parameters?.checkBrackets;
    this.reverseFunctions = parameters?.reverseFunctions;
    this.availableFunctions = parameters.availableFunctions;
    parameters.availableFunctions.forEach((value, key) => {
      this.code = this.code.replace(
        new RegExp(`\\${key}`, "gi"),
        key.toLowerCase(),
      );
    });
  }

  complite() {
    const functions: ParserFunction[] = [];
    const regExpFunc = new RegExp(
      `(${this.availableFunctions
        .keyArray()
        .map((name) => `\\${name}`)
        .join("|")})`,
      "g",
    );

    if (this.checkBrackets) {
      this.checkBracketsComplite(regExpFunc);
    }

    for (const content of this.code.split(/\$/g).reverse()) {
      const [functionName] = `$${content}`.match(regExpFunc) || [];
      if (!functionName && !this.availableFunctions.has(`${functionName}`))
        continue;

      const dataFunction = this.availableFunctions.get(`${functionName}`)!;

      const parserFunction = new ParserFunction(dataFunction);
      const segmentCode =
        this.code
          .split(new RegExp(`\\${functionName}`, "gm"))
          .find((el, index, array) => array.length === index + 1) || "";

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
        const fileds = segmentCode.slice(1).split(/\]/)[0];
        parserFunction.raw = fileds;
        parserFunction.setInside(this.unescapeCode(fileds));
        parserFunction.setFields(
          fileds.split(";").map((fileds) => this.unescapeCode(fileds)),
        );
      }

      this.code = this.replaceLast(
        this.code,
        parserFunction.rawTotal,
        parserFunction.id,
      );
      functions.push(parserFunction);
    }

    const processedIds: string[] = [];
    const loadedFunctions: ParserFunction[] = [];

    for (const func of functions.reverse()) {
      if (processedIds.includes(func.id)) {
        const overloads = func.overloadsFor(functions);
        if (overloads.length) {
          for (const overload of overloads) {
            func.addOverload(overload);
            processedIds.push(overload.id);
          }
        }
      } else {
        const overloads = func.overloadsFor(functions);
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

  checkBracketsComplite(regExp: RegExp) {
    const checkFunctions = this.code.match(regExp) || [];
    for (const name of checkFunctions) {
      const findFunc = this.availableFunctions.find(
        (value, key) => key === name,
      );
      if (findFunc) {
        this.code = this.code.replace(
          new RegExp(`\\${name}`, "g"),
          findFunc.name,
        );
      }
    }
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

export { Complite };
