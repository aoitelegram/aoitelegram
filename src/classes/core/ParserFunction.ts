import { Container } from "./Container";
import { randomUUID } from "node:crypto";
import { AoijsTypeError } from "../AoiError";
import type { CustomJSFunction } from "../AoiTyping";
import { inspect, removePattern } from "../../utils";

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
  public readonly structures: CustomJSFunction;
  public inside: string = "";
  public fields: string[] = [];
  public readonly id: string = `{FUN=${randomUUID()}}`;
  public raw: string = "";
  public overloads: ParserFunction[] = [];
  public parentID: string = "";

  constructor(structures: CustomJSFunction) {
    this.structures = structures;
  }

  get rawTotal(): string {
    return this.structures.brackets && !!this.inside
      ? `${this.structures.name}[${this.raw}]`
      : this.structures.name;
  }

  setInside(inside: string): ParserFunction {
    this.inside = inside;
    return this;
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

  filterFunctions(loadFunctions: ParserFunction[]): ParserFunction[] {
    if (!this.inside) return [];
    const filteredFunctions: ParserFunction[] = [];
    for (const func of loadFunctions) {
      if (this.rawTotal.includes(func.id)) {
        filteredFunctions.push(func);
      }
    }
    return filteredFunctions;
  }

  async resolveFields(
    container: Container,
    indexes?: number[],
  ): Promise<any[]> {
    this.checkArguments();
    if (!this.fields) {
      throw new Error(
        `Attempted to resolve array of functions with no fields: ${removePattern(this.structures.name)}`,
      );
    }

    const resolvedFields = [];
    let currentIndex = 0;

    for (let i = 0; i < this.fields.length; i++) {
      if (indexes && indexes.find((index) => index !== i)) {
        continue;
      }

      const field = this.fields[i];
      const overloads = this.findOverloads(field);

      if (overloads.length) {
        let modifiedField = field;

        for (const overload of overloads) {
          const result = await overload.callback(container, overload);

          if (typeof result !== "object") {
            return [];
          }

          if ("reason" in result) {
            throw new AoijsTypeError(result.reason);
          }

          modifiedField = modifiedField.replace(result.id, result.with);
        }

        resolvedFields.push(modifiedField);
      } else resolvedFields.push(field);
    }

    return resolvedFields;
  }

  checkArguments(): boolean {
    const argsRequired =
      this.structures.fields?.filter(({ required }) => required) || [];
    if (argsRequired.length > this.fields.length) {
      throw new AoijsTypeError(
        `The function ${removePattern(this.structures.name)} expects ${argsRequired.length} parameters, but ${this.fields.length} were received`,
      );
    }
    return true;
  }

  async resolveCode(context: Container, code: string): Promise<string> {
    if (code === undefined) {
      return "";
    }

    for (const overload of this.findOverloads(code)) {
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

  async resolveAllFields(container: Container): Promise<string> {
    const resolvedFields = await this.resolveFields(container);
    if (Array.isArray(resolvedFields)) {
      return resolvedFields.join(";");
    }
    return "";
  }

  findOverloads(code: string): ParserFunction[] {
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
