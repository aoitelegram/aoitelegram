import { AoijsTypeError } from "./AoiError";
import type { AllPromise, DataFunction } from "./AoiTyping";
import type {
  Container,
  ParserFunction,
  ICallbackResolve,
  ICallbackReject,
} from "./core/";

class FunctionManager {
  name: string;
  params: string[];
  aliases: string[];
  brackets?: boolean;
  type?: "javascript" | "aoitelegram";
  fields: {
    name?: string;
    required?: boolean;
    rest?: boolean;
  }[];
  inside: {
    name?: string;
    required?: boolean;
  };
  callback?: (
    ctx: Container,
    func: ParserFunction,
  ) => AllPromise<ICallbackResolve | ICallbackReject>;
  code?: string;

  constructor(
    parameters: DataFunction = {
      fields: [],
    } as unknown as DataFunction,
  ) {
    if (typeof parameters !== "object") {
      throw new AoijsTypeError(
        `The expected type is "object", but received type ${typeof parameters}`,
      );
    }
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

  setName(name: string): FunctionManager {
    if (typeof name !== "string") {
      throw new AoijsTypeError(
        `The expected type is "string", but received type ${typeof name}`,
      );
    }
    this.name = name;
    return this;
  }

  setAliases(aliases: string | string[]): FunctionManager {
    if (typeof aliases !== "string" && !Array.isArray(aliases)) {
      throw new AoijsTypeError(
        `The expected type is "string | array", but received type ${typeof aliases}`,
      );
    }
    if (Array.isArray(aliases)) {
      this.aliases.push(...aliases);
    } else this.aliases.push(aliases);
    return this;
  }

  setFields(
    fields:
      | { name?: string; required: boolean; rest?: boolean }
      | { name?: string; required: boolean; rest?: boolean }[],
  ): FunctionManager {
    if (this.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    if (typeof fields !== "object" && !Array.isArray(fields)) {
      throw new AoijsTypeError(
        `The expected type is "array | object", but received type ${typeof fields}`,
      );
    }
    if (Object.keys(this.inside).length > 1) {
      throw new AoijsTypeError(
        'If you specified "inside" early, then the specified "fields" cannot be entities',
      );
    }
    if (Array.isArray(fields)) {
      this.fields.push(...fields);
    } else this.fields.push(fields);
    return this;
  }

  setInside(inside: { name?: string; required: boolean }): FunctionManager {
    if (this.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    this.inside = inside;
    return this;
  }

  setBrackets(brackets: boolean = true): FunctionManager {
    if (typeof brackets !== "boolean") {
      throw new AoijsTypeError(
        `The expected type is "boolean", but received type ${typeof brackets}`,
      );
    }
    this.brackets = brackets;
    return this;
  }

  onCallback(
    callback: (
      ctx: Container,
      func: ParserFunction,
    ) => AllPromise<ICallbackResolve | ICallbackReject>,
  ): FunctionManager {
    if (this.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    if (typeof callback !== "function") {
      throw new AoijsTypeError(
        `The expected type is "function", but received type ${typeof callback}`,
      );
    }
    this.callback = callback;
    return this;
  }

  setParam(params: string | string[]): FunctionManager {
    if (this.type !== "aoitelegram") {
      throw new AoijsTypeError(
        "This method is only accessible for type 'aoitelegram'",
      );
    }
    if (typeof params !== "string" && !Array.isArray(params)) {
      throw new AoijsTypeError(
        `The expected type is "string | array", but received type ${typeof params}`,
      );
    }
    if (Array.isArray(params)) {
      this.params.push(...params);
    } else this.params.push(params);
    return this;
  }

  setCode(code: string): FunctionManager {
    if (this.type !== "aoitelegram") {
      throw new AoijsTypeError(
        "This method is only accessible for type 'aoitelegram'",
      );
    }
    this.code = code;
    return this;
  }
}

export { FunctionManager };
