import { Container } from "./Container";
import { randomUUID } from "node:crypto";
import { ArgsType } from "../AoiFunction";
import { AoijsTypeError } from "../AoiError";
import type { CustomJSFunction } from "../AoiTyping";
import { inspect, toParse, toConvertParse } from "../../utils";

interface ICallbackResolve {
  id: string;
  code?: string;
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

function makeMessageError(argType: ArgsType[]): string {
  if (argType.length === 1) {
    return `Invalid ${argType[0].charAt(0).toUpperCase() + argType[0].slice(1)} Provided In`;
  }
  return `Invalid ${argType.map((type) => `${type.charAt(0).toUpperCase() + type.slice(1)} | `)} Provided In`;
}

class ParserFunction {
  public readonly structures: CustomJSFunction;
  public inside: string | null = null;
  public fields: string[] = [];
  public readonly id: string = `{FUN=${randomUUID()}}`;
  public raw: string | null = null;
  public overloads: ParserFunction[] = [];
  public parentID: string | null = null;
  public ifContent: ParserFunction[] = [];
  public elseContent: ParserFunction[] = [];
  public elseIfContent: ParserFunction[] = [];
  public elseProcessed: boolean = false;
  public elseIfProcessed: boolean = false;

  constructor(structures: CustomJSFunction) {
    this.structures = structures;
  }

  get rawTotal(): string {
    return this.structures.brackets && this.inside
      ? `${this.structures.name.toLowerCase()}[${this.raw}]`
      : this.structures.name.toLowerCase();
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
    checkArguments: boolean = true,
  ): Promise<any[]> {
    if (!this.fields) {
      throw new AoijsTypeError(
        `Attempted to resolve array of functions with no fields: ${this.structures.name}`,
        { errorFunction: this.structures.name },
      );
    }

    const resolvedFields = [];

    for (let i = 0; i < this.fields.length; i++) {
      if (indexes && indexes.indexOf(i) === -1) {
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

    if (checkArguments) {
      return await this.resolveTypeArguments(
        resolvedFields,
        container,
        indexes,
      );
    }

    return resolvedFields;
  }

  async resolveTypeArguments(
    array: any[],
    container: Container,
    indexes?: number[],
  ): Promise<any[]> {
    if (!array) return [];
    const result: any[] = [];
    const currentFields = this.structures;

    if (!currentFields || !currentFields.fields) {
      throw new AoijsTypeError(
        "To check the specified arguments, the function must have a description of the arguments (fields)",
        { errorFunction: this.structures.name },
      );
    }

    const argsRequired = currentFields.fields.filter(
      ({ required }) => required,
    );
    if (argsRequired.length > this.fields.length) {
      throw new AoijsTypeError(
        `The function ${this.structures.name} expects ${argsRequired.length} parameters, but ${this.fields.length} were received`,
        { errorFunction: this.structures.name },
      );
    }

    if (array.length < currentFields.fields.length) {
      for (let i = 0; i < currentFields.fields.length - array.length; i++) {
        array.push(undefined);
      }
    }

    for (let i = 0; i < array.length; i++) {
      if (indexes && indexes.indexOf(i) === -1) {
        continue;
      }

      const currentField = array[i];
      const currentFieldInfo = currentFields.fields[i];

      if (!currentFieldInfo) {
        throw new AoijsTypeError(
          `Failed to find information about field ${i + 1} in the argument description`,
          { errorFunction: this.structures.name },
        );
      }

      const expectType = currentFieldInfo.type;

      if (typeof currentField === "undefined") {
        if ("defaultValue" in currentFieldInfo && !currentFieldInfo.required) {
          if (typeof currentFieldInfo.defaultValue === "function") {
            result.push(await currentFieldInfo.defaultValue(container));
          } else result.push(currentFieldInfo.defaultValue);
        } else result.push(undefined);
        continue;
      }

      if (currentFieldInfo.rest) {
        if (currentFields.fields.slice(i + 1).length > 1) {
          throw new AoijsTypeError(
            "When using rest parameters, description of the following parameters is not available",
            { errorFunction: this.structures.name },
          );
        }

        for (let x = i; x < array.length; x++) {
          const receivedType = toParse(array[x]) as ArgsType;
          if (
            !expectType ||
            expectType.indexOf(ArgsType.String) !== -1 ||
            expectType.indexOf(ArgsType.Any) !== -1
          ) {
            result.push(toConvertParse(array[x]));
          } else if (expectType.indexOf(receivedType) !== -1) {
            result.push(toConvertParse(array[x]));
          } else {
            throw new AoijsTypeError(
              `${makeMessageError(Array.from(new Set(expectType)))} "${array[x]}"`,
              { errorFunction: this.structures.name },
            );
          }
        }
        return result;
      }

      if (
        !expectType ||
        expectType.indexOf(ArgsType.String) !== -1 ||
        expectType.indexOf(ArgsType.Any) !== -1
      ) {
        result.push(toConvertParse(currentField));
      } else if (expectType.indexOf(toParse(currentField) as ArgsType) !== -1) {
        result.push(toConvertParse(currentField));
      } else {
        throw new AoijsTypeError(
          `${makeMessageError(Array.from(new Set(expectType)))} "${currentField}"`,
          { errorFunction: this.structures.name },
        );
      }
    }
    return result;
  }

  async resolveCode(container: Container, code: string): Promise<string> {
    if (code === undefined) {
      return "";
    }

    for (const overload of this.findOverloads(code)) {
      const result = await overload.callback(container, overload);

      if (!result) {
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
    container: Container,
    func: ParserFunction,
    code?: string,
  ): Promise<ICallbackResolve | ICallbackReject> {
    return Promise.resolve(this.structures.callback(container, func, code));
  }

  resolve(result: any = "", code?: any): ICallbackResolve {
    return { id: this.id, code, replace: this.rawTotal, with: inspect(result) };
  }

  reject(reason: string = "", customError?: boolean): ICallbackReject {
    return {
      id: this.id,
      custom: customError,
      reason: reason,
    };
  }
}

export { ParserFunction, ICallbackResolve, ICallbackReject, IOveeload };
