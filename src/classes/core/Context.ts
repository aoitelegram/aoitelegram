import { inspect } from "node:util";
import { Container } from "./Container";
import { randomUUID } from "node:crypto";
import { AoijsTypeError } from "../AoiError";
import type { DataFunction } from "../AoiTyping";

enum FieldsType {
  "String" = 1,
  "Number" = 2,
  "Boolean" = 3,
  "Any" = 4,
}

interface IFieldData {
  name: string;
  type?: keyof FieldsType;
  required?: boolean;
  requiredModules?: boolean;
}

interface ICallbackResolve {
  id: string;
  replace: string;
  with: string;
}

interface IOveeload {
  id: string;
  callback: Function;
}

class Context<TArray extends unknown[]> {
  public readonly id: string;
  public inside: string = "";
  public fields: string[] = [];
  public total: string;
  public underFunctions: Context<TArray>[] = [];
  public readonly data: DataFunction;

  constructor(data: DataFunction) {
    this.data = data;
    this.id = `${randomUUID()}-${Date.now()}`;
    this.underFunctions = [];
    this.total =
      data.brackets && (!data.optional || this.inside)
        ? `${data.name}[${this.inside}]`
        : this.data.name;
  }

  setInside(value: string): this {
    this.inside = value;
    return this;
  }

  setFields(value: string[]): this {
    this.fields = value;
    return this;
  }

  addUnderFunctions(overload: Context<TArray>): this {
    this.underFunctions.push(overload);
    return this;
  }

  underFunctionsFor(array: Context<TArray>[]): Context<TArray>[] {
    if (undefined === this.inside) return [];
    return array.filter((item) => this.total.includes(item.id));
  }

  async resolveTypedArray(
    data: Container,
    indexes: number[],
  ): Promise<string[]> {
    return this.resolveArray(data, indexes);
  }

  async resolveArray(data: Container, indexes?: number[]): Promise<string[]> {
    if (!this.fields) {
      throw new AoijsTypeError(
        `Attempted to resolve array of function with no fields: ${this.data.name}`,
      );
    }

    let result: string[] = [];
    let currentIndex = 0;

    for (const field of this.fields) {
      if (indexes && indexes.includes(currentIndex)) {
        result.push(field);
      } else {
        const underFunctionsInCode = this.underFunctionsInCode(field);
        if (underFunctionsInCode.length) {
          let resolvedField = field;
          for (const overload of underFunctionsInCode) {
            const resolved = await overload.callback(data, overload);
            if (null === resolved) return [];
            resolvedField = resolvedField.replace(resolved.id, resolved.with);
          }
          result.push(resolvedField);
          currentIndex++;
        } else {
          result.push(field);
          currentIndex++;
        }
      }
    }

    return result;
  }

  async checkArg(
    data: any,
    field: any,
    value: any,
    arg: any,
    output: any,
  ): Promise<boolean> {
    // implement your logic here
    return true;
  }

  async resolveCode(data: Container, code: string): Promise<string> {
    if (undefined === code) return "";
    for (const overload of this.underFunctionsInCode(code)) {
      const resolved = await overload.callback(data, overload);
      if (null == resolved) return "";
      code = code.replace(resolved.id, resolved.with);
    }
    return code;
  }

  async resolveAll(data: Container): Promise<string | undefined> {
    const resolvedArray = await this.resolveArray(data);
    if (undefined !== resolvedArray) return resolvedArray.join(";");
  }

  private underFunctionsInCode(code: string): IOveeload[] {
    return this.underFunctions.filter((overload) => code.includes(overload.id));
  }

  async callback(
    data: Container,
    overload: IOveeload,
  ): Promise<ICallbackResolve> {
    return this.data.callback(data, overload);
  }

  private resolve(result: unknown): ICallbackResolve {
    return {
      id: this.id,
      replace: this.total,
      with: inspect(result),
    };
  }
}

export { Context, FieldsType, IFieldData, ICallbackResolve, IOveeload };
