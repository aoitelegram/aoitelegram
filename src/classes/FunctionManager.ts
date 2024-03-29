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
  constructor(
    public parameters: IFunctionManager = {
      fields: [],
    } as unknown as IFunctionManager,
  ) {}

  setName(name: string) {
    if (typeof name !== "string") {
      throw new AoijsTypeError(
        `The expected type is "string", but received type ${typeof name}`,
      );
    }
    this.parameters.name = name;
    return this;
  }

  setFields(fields: { name?: string; required: boolean }[]) {
    if (this.parameters.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    if (!Array.isArray(fields)) {
      throw new AoijsTypeError(
        `The expected type is "array", but received type ${typeof fields}`,
      );
    }
    if (this.parameters?.inside) {
      throw new AoijsTypeError(
        'If you specified "inside" early, then the specified "fields" cannot be entities',
      );
    }
    fields.map(
      (fields) =>
        "fields" in this.parameters && this.parameters.fields?.push(fields),
    );
    return this;
  }

  setInside(inside: { name?: string; required: boolean }) {
    if (this.parameters.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    this.parameters.inside = inside;
    return this;
  }

  setBrackets(brackets: boolean = true) {
    if (typeof brackets !== "boolean") {
      throw new AoijsTypeError(
        `The expected type is "boolean", but received type ${typeof brackets}`,
      );
    }
    this.parameters.brackets = brackets;
    return this;
  }

  onCallback(callback: (ctx: Container, func: Context<any>) => unknown) {
    if (this.parameters.type === "aoitelegram") {
      throw new AoijsTypeError(
        "Methods for type 'javascript' are not accessible when the type is set to 'aoitelegram'",
      );
    }
    if (typeof callback !== "function") {
      throw new AoijsTypeError(
        `The expected type is "function", but received type ${typeof callback}`,
      );
    }
    this.parameters.callback = callback;
    return;
  }

  setParam(param: string[]) {
    if (this.parameters.type !== "aoitelegram") {
      throw new AoijsTypeError(
        "This method is only accessible for type 'aoitelegram'",
      );
    }
    this.parameters.param = param;
    return this;
  }

  setCode(code: string) {
    if (this.parameters.type !== "aoitelegram") {
      throw new AoijsTypeError(
        "This method is only accessible for type 'aoitelegram'",
      );
    }
    this.parameters.code = code;
    return this;
  }
}

export { FunctionManager };
