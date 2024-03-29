import { AoijsTypeError } from "./AoiError";
import type { Container, Context } from "./core/";

type IFunctionManager =
  | {
      name: string;
      brackets?: boolean;
      type?: "javascript";
      fields?: {
        name?: string;
        required?: boolean;
      }[];
      inside?: {
        name?: string;
        required?: boolean;
      };
      callback: (ctx: Container, func: Context<any>) => unknown;
    }
  | {
      name: string;
      brackets?: boolean;
      type: "aoitelegram";
      param?: string[];
      code: string;
    };

class FunctionManager {
  name: string;
  brackets?: boolean;
  param: string[];
  type?: "javascript" | "aoitelegram";
  fields: {
    name?: string;
    required?: boolean;
  }[];
  inside: {
    name?: string;
    required?: boolean;
  };
  callback?: (ctx: Container, func: Context<any>) => unknown;
  code?: string;

  constructor(
    parameters: IFunctionManager = {
      fields: [],
    } as unknown as IFunctionManager,
  ) {
    if (typeof parameters !== "object") {
      throw new AoijsTypeError(
        `The expected type is "object", but received type ${typeof parameters}`,
      );
    }
    this.name = parameters.name;
    this.brackets = parameters.brackets;
    this.type = parameters.type || "javascript";
    this.fields = ("fields" in parameters && parameters.fields) || [];
    this.inside = ("inside" in parameters && parameters.inside) || {};
    this.param = ("param" in parameters && parameters.param) || [];
    this.callback =
      ("callback" in parameters && parameters.callback) || undefined;
    this.code = ("code" in parameters && parameters.code) || "";
  }

  setName(name: string) {
    if (typeof name !== "string") {
      throw new AoijsTypeError(
        `The expected type is "string", but received type ${typeof name}`,
      );
    }
    this.name = name;
    return this;
  }

  setFields(fields: { name?: string; required: boolean }) {
    if (this.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    if (typeof fields !== "object") {
      throw new AoijsTypeError(
        `The expected type is "object", but received type ${typeof fields}`,
      );
    }
    if (Object.keys(this.inside).length > 1) {
      throw new AoijsTypeError(
        'If you specified "inside" early, then the specified "fields" cannot be entities',
      );
    }
    this.fields.push(fields);
    return this;
  }

  setInside(inside: { name?: string; required: boolean }) {
    if (this.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    this.inside = inside;
    return this;
  }

  setBrackets(brackets: boolean = true) {
    if (typeof brackets !== "boolean") {
      throw new AoijsTypeError(
        `The expected type is "boolean", but received type ${typeof brackets}`,
      );
    }
    this.brackets = brackets;
    return this;
  }

  onCallback(callback: (ctx: Container, func: Context<any>) => unknown) {
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

  setParam(param: string[]) {
    if (this.type !== "aoitelegram") {
      throw new AoijsTypeError(
        "This method is only accessible for type 'aoitelegram'",
      );
    }
    if (!Array.isArray(param)) {
      throw new AoijsTypeError(
        `The expected type is "array", but received type ${typeof param}`,
      );
    }
    this.param.push(...param);
    return this;
  }

  setCode(code: string) {
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
