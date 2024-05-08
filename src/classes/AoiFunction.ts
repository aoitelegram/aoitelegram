import { AoijsTypeError } from "./AoiError";
import type { PossiblyAsync, DataFunction } from "./AoiTyping";
import type {
  Container,
  ParserFunction,
  ICallbackResolve,
  ICallbackReject,
} from "./core/";

enum ArgsType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Object = "object",
  Array = "array",
  Any = "any",
}

class AoiFunction {
  public name: string;
  public params: string[];
  public aliases: string[];
  public brackets?: boolean;
  public type?: "javascript" | "aoitelegram";
  public fields: {
    name?: string;
    rest?: boolean;
    type?: ArgsType[];
    required?: boolean;
    defaultValue?: any[];
  }[];
  public inside: {
    name?: string;
    required?: boolean;
  };
  public callback?: (
    ctx: Container,
    func: ParserFunction,
    code?: string,
  ) => PossiblyAsync<ICallbackResolve | ICallbackReject>;
  public code?: string;

  constructor(parameters: DataFunction = {} as DataFunction) {
    if (typeof parameters !== "object") {
      throw new AoijsTypeError(
        `The expected type is 'object', but received type ${typeof parameters}`,
      );
    } else this.#validateOptions(parameters);

    this.name = parameters.name;
    this.aliases = parameters.aliases || [];
    this.type = parameters.type || "javascript";
    this.brackets = ("brackets" in parameters && parameters.brackets) || false;
    this.fields = ("fields" in parameters && parameters.fields) || [];
    this.inside = ("inside" in parameters && parameters.inside) || {};
    this.params = ("params" in parameters && parameters.params) || [];
    this.callback =
      ("callback" in parameters && parameters.callback) || undefined;
    this.code = ("code" in parameters && parameters.code) || "";
  }

  setName(name: string): AoiFunction {
    if (typeof name !== "string") {
      throw new AoijsTypeError(
        `The expected type is 'string', but received type ${typeof name}`,
      );
    }
    this.name = name;
    return this;
  }

  setAliases(aliases: string | string[]): AoiFunction {
    if (typeof aliases !== "string" && !Array.isArray(aliases)) {
      throw new AoijsTypeError(
        `The expected type is 'string | array', but received type ${typeof aliases}`,
      );
    }
    if (Array.isArray(aliases)) {
      this.aliases.push(...aliases);
    } else this.aliases.push(aliases);
    return this;
  }

  setFields(
    fields:
      | {
          name?: string;
          rest?: boolean;
          type?: ArgsType[];
          required?: boolean;
          defaultValue?: any[];
        }
      | {
          name?: string;
          rest?: boolean;
          type?: ArgsType[];
          required?: boolean;
          defaultValue?: any[];
        }[],
  ): AoiFunction {
    if (this.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    if (typeof fields !== "object" && !Array.isArray(fields)) {
      throw new AoijsTypeError(
        `The expected type is 'array | object', but received type ${typeof fields}`,
      );
    }
    if (Object.keys(this.inside).length > 1) {
      throw new AoijsTypeError(
        "If you specified 'inside' early, then the specified 'fields' cannot be entities",
      );
    }
    if (Array.isArray(fields)) {
      this.fields.push(...fields);
    } else this.fields.push(fields);
    return this;
  }

  setInside(inside: { name?: string; required: boolean }): AoiFunction {
    if (this.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    this.inside = inside;
    return this;
  }

  setBrackets(brackets: boolean = true): AoiFunction {
    if (typeof brackets !== "boolean") {
      throw new AoijsTypeError(
        `The expected type is 'boolean', but received type ${typeof brackets}`,
      );
    }
    this.brackets = brackets;
    return this;
  }

  onCallback(
    callback: (
      ctx: Container,
      func: ParserFunction,
      code?: string,
    ) => PossiblyAsync<ICallbackResolve | ICallbackReject>,
  ): AoiFunction {
    if (this.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    if (typeof callback !== "function") {
      throw new AoijsTypeError(
        `The expected type is 'function', but received type ${typeof callback}`,
      );
    }
    this.callback = callback;
    return this;
  }

  setParam(params: string | string[]): AoiFunction {
    if (this.type !== "aoitelegram") {
      throw new AoijsTypeError(
        "This method is only accessible for type 'aoitelegram'",
      );
    }
    if (typeof params !== "string" && !Array.isArray(params)) {
      throw new AoijsTypeError(
        `The expected type is 'string | array', but received type ${typeof params}`,
      );
    }
    if (Array.isArray(params)) {
      this.params.push(...params);
    } else this.params.push(params);
    return this;
  }

  setCode(code: string): AoiFunction {
    if (this.type !== "aoitelegram") {
      throw new AoijsTypeError(
        "This method is only accessible for type 'aoitelegram'",
      );
    }
    this.code = code;
    return this;
  }

  #validateOptions(options: Record<string, any>) {
    if ("name" in options && typeof options.name !== "string") {
      throw new AoijsTypeError("Name property is missing or not a string");
    }

    if (
      options.aliases &&
      (!Array.isArray(options.aliases) ||
        !options.aliases.every((element) => typeof element === "string"))
    ) {
      throw new AoijsTypeError("Each element in aliases should be a string");
    }

    if (
      options.type !== "javascript" &&
      options.type !== "aoitelegram" &&
      options.type !== undefined
    ) {
      throw new AoijsTypeError(
        "Type must be either 'javascript' or 'aoitelegram'",
      );
    }

    if ("brackets" in options && typeof options.brackets !== "boolean") {
      throw new AoijsTypeError("Brackets must be a boolean value");
    }

    if ("fields" in options) {
      if ("inside" in options) {
        throw new AoijsTypeError(
          "If you specified 'inside' earlier, then 'fields' cannot be entities",
        );
      }

      if (!Array.isArray(options.fields)) {
        throw new AoijsTypeError(
          `Fields must be an array, but received type ${typeof options.fields}`,
        );
      }

      if (!("brackets" in options)) {
        throw new AoijsTypeError(
          "If you specified 'fields', then 'brackets' must also be specified",
        );
      }

      if (!options.fields.some((element: any) => "required" in element)) {
        throw new AoijsTypeError(
          "Each element in fields must contain an object with a required property",
        );
      }
    }

    if ("inside" in options) {
      if ("fields" in options) {
        throw new AoijsTypeError(
          "If you specified 'fields' earlier, then 'inside' cannot be entities",
        );
      }

      if (typeof options.inside !== "object") {
        throw new AoijsTypeError(
          `Inside must be an object, but received type ${typeof options.inside}`,
        );
      }

      if (!("required" in options.inside)) {
        throw new AoijsTypeError("Each parameter must contain a string");
      }
    }

    if ("params" in options) {
      if (options.params.some((element: any) => typeof element !== "string")) {
        throw new AoijsTypeError("Each element in params must be a string");
      }

      if (options.type !== "aoitelegram") {
        throw new AoijsTypeError(
          "Params method is only accessible for type 'javascript' when type is set to 'aoitelegram'",
        );
      }
    }

    if ("callback" in options) {
      if (typeof options.callback !== "function") {
        throw new AoijsTypeError(
          `Callback must be a function, but received type ${typeof options.callback}`,
        );
      }

      if (options.type === "aoitelegram") {
        throw new AoijsTypeError(
          "Callback method is not accessible for type 'aoitelegram' when type is set to 'javascript'",
        );
      }
    }

    if ("code" in options) {
      if (typeof options.code !== "string") {
        throw new AoijsTypeError(
          `Code must be a string, but received type ${typeof options.code}`,
        );
      }

      if (options.type !== "aoitelegram") {
        throw new AoijsTypeError(
          "Code method is not accessible for type 'javascript' when type is set to 'aoitelegram'",
        );
      }
    }
  }
}

export { AoiFunction, ArgsType };
