import { inspect } from "../../utils";
import { Container } from "./Container";
import { randomUUID } from "node:crypto";
import { AoijsTypeError } from "../AoiError";
import type { CustomJSFunction } from "../AoiTyping";

interface ICallbackResolve {
  id: string;
  replace: string;
  with: string;
}

interface ICallbackReject {
  id: string;
  reason: string;
  custom?: boolean;
}

interface IOveeload {
  id: string;
  callback: Function;
}

class ParserFunction {
  public structures: CustomJSFunction;
  public inside: string = "";
  public fields: string[] = [];
  public id: string = `{FUN=${randomUUID()}}`;
  public raw: string = "";
  public overloads = new Array<ParserFunction>();
  public parentID: string = "";

  constructor(structures: CustomJSFunction) {
    this.structures = structures;
  }

  setInside(inside: string): ParserFunction {
    this.inside = inside;
    return this;
  }

  get rawTotal(): string {
    return this.structures.brackets && !!this.inside
      ? `${this.structures.name}[${this.raw}]`
      : this.structures.name;
  }

  setFields(fields: string | string[]): ParserFunction {
    this.fields = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  setParent(parentID: string): ParserFunction {
    this.parentID = parentID;
    return this;
  }

  addOverload(overloads: ParserFunction): ParserFunction {
    overloads.setParent(this.id);
    this.overloads.push(overloads);
    return this;
  }

  overloadsFor(loadFunctions: ParserFunction[]): ParserFunction[] {
    if (!this.inside) return [];
    const functions: ParserFunction[] = [];
    for (const func of loadFunctions) {
      if (this.rawTotal.includes(func.id)) {
        functions.push(func);
      }
    }
    return functions;
  }

  async resolveArray(
    context: Container,
    indicesToSkip?: number[],
  ): Promise<any[]> {
    if (!this.fields) {
      throw new Error(
        `Attempted to resolve array of function with no fields: ${this.structures.name}`,
      );
    }

    const resolvedFields = [];
    let currentIndex = 0;

    for (const field of this.fields) {
      const overloads = this.overloadsInCode(field);

      if (overloads.length) {
        let modifiedField = field;

        for (const overload of overloads) {
          const result = await overload.callback(context, overload);

          if (result === null) {
            return [];
          }

          if ("reason" in result) {
            throw new AoijsTypeError(result.reason);
          }

          modifiedField = modifiedField.replace(result.id, result.with);
        }

        resolvedFields.push(modifiedField);
        currentIndex++;
      } else {
        resolvedFields.push(field);
        currentIndex++;
      }
    }

    const resolvedArgs = [];
    currentIndex = 0;

    if (!Array.isArray(this.structures?.fields)) return [];

    for (let i = 0; i < this.structures?.fields?.length; i++) {
      if (indicesToSkip && indicesToSkip.includes(currentIndex)) {
        resolvedArgs.push(resolvedFields[i]);
      } else {
        const currentField = this.structures.fields[i];
        const currentArg = resolvedFields[i];
        const originalArg = currentArg;

        if (currentField && currentField.rest) {
          for (const arg of this.fields.slice(i)) {
            const resolvedArg = resolvedFields[currentIndex];

            if ((await this.checkArg()) === undefined) {
              return [];
            }

            currentIndex++;
          }
        } else {
          if ((await this.checkArg()) === undefined) {
            return [];
          }

          currentIndex++;
        }
      }
    }

    return resolvedArgs;
  }

  async checkArg(): Promise<boolean> {
    return true;
  }

  async resolveCode(context: Container, code: string): Promise<string> {
    if (code === undefined) {
      return "";
    }

    for (const overload of this.overloadsInCode(code)) {
      const result = await overload.callback(context, overload);
      if (result === null) {
        return code;
      }
      if ("reason" in result) {
        throw new AoijsTypeError(result.reason);
      }
      code = code.replace(result.id, result.with);
    }

    return code;
  }

  async resolveAll(context: Container): Promise<string> {
    const result = await this.resolveArray(
      context,
      this.fields.map((value, index) => index),
    );
    if (Array.isArray(result)) {
      return result.join(";");
    }
    return "";
  }

  overloadsInCode(code: string): ParserFunction[] {
    return this.overloads.filter((func) => code.includes(func.id));
  }

  async callback(
    context: Container,
    func: ParserFunction,
  ): Promise<ICallbackResolve | ICallbackReject> {
    return Promise.resolve(this.structures.callback(context, func));
  }

  resolve(result?: any): ICallbackResolve {
    return { id: this.id, replace: this.rawTotal, with: inspect(result) };
  }

  reject(reason?: string, customError?: boolean): ICallbackReject {
    return {
      id: this.id,
      custom: customError,
      reason: reason || "",
    };
  }
}

export { ParserFunction, ICallbackResolve, ICallbackReject, IOveeload };
