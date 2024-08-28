import { Container } from "./Container";
import { randomUUID } from "node:crypto";
import { ArgsType } from "../AoiFunction";
import { AoijsTypeError } from "../AoiError";
import type { CustomJSFunction } from "../AoiTyping";
import { inspect, toParse, toConvertParse } from "@aoitelegram/util";

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

function makeMessageError(argTypes: ArgsType[]): string {
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  if (argTypes.length === 1) {
    return `Invalid ${capitalize(argTypes[0])} Provided In`;
  }

  const formattedTypes = argTypes.map(capitalize).join(" | ");
  return `Invalid ${formattedTypes} Provided In`;
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
  public catchProcessed: boolean = false;
  public tryContent: ParserFunction[] = [];
  public catchContent: ParserFunction[] = [];
  public isSilentFunction: boolean = false;

  constructor(structures: CustomJSFunction) {
    this.structures = structures;
  }

  get rawTotal(): string {
    if (this.isSilentFunction) {
      return this.structures.brackets && this.inside
        ? `$#${this.structures.name.toLowerCase().substr(1)}[${this.raw}]`
        : `$#${this.structures.name.toLowerCase().substr(1)}`;
    }
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
          const result = await overload.callback(
            container,
            overload,
            `${this.inside}`,
          );

          if (overload.isSilentFunction && "reason" in result) {
            modifiedField = modifiedField.replace(result.id, "undefined");
          }

          if (container.stopCode === true) {
            throw new AoijsTypeError("The process has been stopped");
          }

          if (typeof result !== "object") {
            return [];
          }

          if ("reason" in result) {
            throw new AoijsTypeError(result.reason, {
              errorFunction: overload.structures.name,
              customError: result.custom,
            });
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
    const currentStructures = this.structures;

    if (!("fields" in currentStructures)) {
      throw new AoijsTypeError(
        "To check the specified arguments, the function must have a description of the arguments (fields)",
        { errorFunction: currentStructures.name },
      );
    }

    const argsRequired = currentStructures.fields.filter(
      ({ required }) => required,
    );
    if (argsRequired.length > this.fields.length) {
      throw new AoijsTypeError(
        `The function ${currentStructures.name} expects ${argsRequired.length} parameters, but ${this.fields.length} were received`,
        { errorFunction: currentStructures.name },
      );
    }

    if (array.length < currentStructures.fields.length) {
      for (let i = 0; i < currentStructures.fields.length; i++) {
        array.push(undefined);
      }
      array = array.slice(0, currentStructures.fields.length);
    }

    const parsedFields = await Promise.all(
      array.map((field, i) => {
        if (indexes && indexes.indexOf(i) === -1) {
          return null;
        } else {
          return toParse(
            field,
            (
              currentStructures.fields[i] as { type: ArgsType[] }
            )?.type?.indexOf(ArgsType.Any) !== -1,
            container.telegram,
          );
        }
      }),
    );

    for (let i = 0; i < array.length; i++) {
      if (indexes && indexes.indexOf(i) === -1) {
        continue;
      }

      const currentField = array[i];
      const currentFieldInfo = currentStructures.fields[i];

      if (!currentFieldInfo) {
        throw new AoijsTypeError(
          `Failed to find information about field ${i + 1} in the argument description`,
          { errorFunction: currentStructures.name },
        );
      }

      if (!currentField) {
        if ("defaultValue" in currentFieldInfo && !currentFieldInfo.required) {
          if (typeof currentFieldInfo.defaultValue === "function") {
            result.push(await currentFieldInfo.defaultValue(container));
          } else result.push(currentFieldInfo.defaultValue);
        } else result.push(undefined);
        continue;
      }

      const expectType =
        "type" in currentFieldInfo ? currentFieldInfo.type : [ArgsType.Any];

      if ("rest" in currentFieldInfo && currentFieldInfo.rest) {
        if (currentStructures.fields.slice(i + 1).length > 1) {
          throw new AoijsTypeError(
            "When using rest parameters, description of the following parameters is not available",
            { errorFunction: currentStructures.name },
          );
        }

        for (let x = i; x < array.length; x++) {
          const receivedType = parsedFields[x] as ArgsType;
          if (!expectType || expectType.indexOf(ArgsType.Any) !== -1) {
            result.push(
              toConvertParse(
                array[x],
                currentFieldInfo.converType || receivedType,
              ),
            );
          } else if (expectType.indexOf(receivedType) !== -1) {
            result.push(
              toConvertParse(
                array[x],
                currentFieldInfo.converType || receivedType,
              ),
            );
          } else if (this.isSilentFunction) {
            result.push(undefined);
          } else {
            throw new AoijsTypeError(
              `${makeMessageError(Array.from(new Set(expectType)))} "${array[x]}"`,
              { errorFunction: currentStructures.name },
            );
          }
        }
        return result;
      }

      const receivedType = parsedFields[i] as ArgsType;
      if (!expectType || expectType.indexOf(ArgsType.Any) !== -1) {
        result.push(
          toConvertParse(
            currentField,
            ("converType" in currentFieldInfo && currentFieldInfo.converType) ||
              receivedType,
          ),
        );
      } else if (expectType.indexOf(receivedType) !== -1) {
        result.push(
          toConvertParse(
            currentField,
            ("converType" in currentFieldInfo && currentFieldInfo.converType) ||
              receivedType,
          ),
        );
      } else if (this.isSilentFunction) {
        result.push(undefined);
      } else {
        throw new AoijsTypeError(
          `${makeMessageError(Array.from(new Set(expectType)))} "${currentField}"`,
          { errorFunction: currentStructures.name },
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
      const result = await overload.callback(container, overload, code);

      if (overload.structures.name === "$return") {
        container.stopCode = false;
        return "with" in result ? result.with : "";
      }

      if (container.stopCode === true) {
        throw new AoijsTypeError("The process has been stopped");
      }

      if (!result) {
        return code;
      }

      if (overload.isSilentFunction && "reason" in result) {
        code = code.replace(result.id, "undefined");
      }

      if ("reason" in result) {
        throw new AoijsTypeError(result.reason, {
          errorFunction: overload.structures.name,
          customError: result.custom,
        });
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

  getOther<T>(): T {
    return this.structures.other as T;
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

export { ParserFunction, ICallbackResolve, ICallbackReject };
