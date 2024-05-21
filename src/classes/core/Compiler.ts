import { AoijsTypeError } from "../AoiError";
import { ParserFunction } from "./ParserFunction";
import { Collection } from "@telegram.ts/collection";
import { unescapeCode, escapeCode } from "@utils/Helpers";
import type { CommandData, CustomJSFunction } from "../AoiTyping";

type SuccessCompiler = CommandData<{ functions: ParserFunction[] }>;

interface ErrorCompiler {
  func: string;
  line: number;
  errorCode?: string;
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
    for (const [name, func] of this.availableFunctions.sort(
      (a, b) => b[0].length - a[0].length,
    )) {
      this.code = this.code.replace(
        new RegExp(`\\${name}`, "gi"),
        name.toLowerCase(),
      );
    }
  }

  compile(): SuccessCompiler | ErrorCompiler {
    const parsedFunctions: ParserFunction[] = [];
    const functionRegExp = new RegExp(
      `(${this.availableFunctions
        .keys()
        .map((name) => `\\${name}`)
        .join("|")})`,
      "g",
    );

    const segments = this.code.split(/\$/g).reverse();
    for (const segment of segments) {
      const matches = `$${segment}`.match(functionRegExp) || [];
      const functionName = matches?.[0];
      if (!functionName || !this.availableFunctions.has(`${functionName}`))
        continue;

      const dataFunction = this.availableFunctions.get(`${functionName}`)!;

      const parserFunction = new ParserFunction(dataFunction);
      const segmentCode =
        this.code.split(new RegExp(`\\${functionName}`, "gm")).pop() || "";

      if (
        dataFunction.brackets &&
        dataFunction.fields?.[0].required &&
        !segmentCode.startsWith("[")
      ) {
        return this.bracketError(dataFunction.name, "brackets");
      }

      if (
        dataFunction.brackets &&
        segmentCode.startsWith("[") &&
        !segmentCode.includes("]")
      ) {
        return this.bracketError(dataFunction.name, "bracket closing");
      }

      if (segmentCode.startsWith("[")) {
        const fields = this.extractFields(dataFunction.name, segmentCode);

        if (typeof fields !== "string") {
          return fields;
        }

        parserFunction.raw = fields;
        parserFunction.setInside(unescapeCode(fields));
        parserFunction.setFields(
          fields.split(";").map((field) => unescapeCode(field)),
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
      code: unescapeCode(this.code),
      functions: this.reverseFunctions
        ? loadedFunctions.reverse()
        : loadedFunctions,
    };
  }

  extractFields(name: string, segmentCode: string): ErrorCompiler | string {
    let count = 0;
    let endIndex = -1;

    for (let i = 0; i < segmentCode.length; i++) {
      if (segmentCode[i] === "[") {
        count++;
      } else if (segmentCode[i] === "]") {
        count--;
        if (count === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex !== -1 && count === 0) {
      return segmentCode.substring(1, endIndex);
    } else {
      return this.bracketError(name, "bracket closing");
    }
  }

  bracketError(func: string, description: string): ErrorCompiler {
    const lines = this.reverseFunctions
      ? this.code.split(/\n/g).reverse()
      : this.code.split(/\n/g);
    const errorLine = lines.findIndex((line) => line.includes(func)) + 1;

    return {
      func,
      line: errorLine,
      errorCode: lines[errorLine],
      description: `This function requires ${description} at line ${lines.length}:${errorLine}`,
    };
  }

  replaceLast(str: string, search: string, replacement: string): string {
    const lastIndex = str.lastIndexOf(search);
    if (lastIndex === -1) {
      return str;
    }
    return (
      str.slice(0, lastIndex) +
      replacement +
      str.slice(lastIndex + search.length)
    );
  }
}

export { Compiler, SuccessCompiler, ErrorCompiler };
