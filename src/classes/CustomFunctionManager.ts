import { version } from "../index";
import type { AoiBase } from "./AoiBase";
import { AoijsTypeError } from "./AoiError";
import type { AoiFunction } from "./AoiFunction";
import { Collection } from "@telegram.ts/collection";
import type { DataFunction, MaybeArray, CustomJSFunction } from "./AoiTyping";

class CustomFunctionManager {
  constructor(
    public telegram: AoiBase,
    public availableFunctions: Collection<string, CustomJSFunction>,
  ) {}

  createCustomFunction(dataFunction: MaybeArray<DataFunction | AoiFunction>) {
    const functions = Array.isArray(dataFunction)
      ? dataFunction
      : [dataFunction];
    functions.forEach((func) => this.addCustomFunction(func));
    return this;
  }

  ensureCustomFunction(dataFunction: MaybeArray<DataFunction | AoiFunction>) {
    const functions = Array.isArray(dataFunction)
      ? dataFunction
      : [dataFunction];
    functions.forEach((func) => {
      const { name, normalizedFunc } = this.validateAndNormalizeFunction(func);
      this.availableFunctions.set(name, normalizedFunc);
    });
    return this;
  }

  removeFunction(functionName: string | string[]): boolean {
    const functionNames = Array.isArray(functionName)
      ? functionName
      : [functionName];
    if (!functionNames.length) {
      throw new AoijsTypeError("You did not specify the 'name' parameter");
    }

    functionNames.forEach((name) => {
      const lowerCaseName = name.toLowerCase();
      const hasDeleted = this.availableFunctions.delete(lowerCaseName);
      if (!hasDeleted) {
        throw new AoijsTypeError(
          `The function '${lowerCaseName}' does not exist or has already been deleted`,
        );
      }
    });
    return true;
  }

  editCustomFunction(dataFunction: MaybeArray<DataFunction | AoiFunction>) {
    const functionsToEdit = Array.isArray(dataFunction)
      ? dataFunction
      : [dataFunction];
    if (!functionsToEdit.length) {
      throw new AoijsTypeError("You did not specify the 'name' parameter");
    }

    functionsToEdit.forEach((func) => {
      const { name, normalizedFunc } = this.validateAndNormalizeFunction(func);
      if (!this.availableFunctions.has(name)) {
        throw new AoijsTypeError(
          `The function '${name}' does not exist; You can only modify functions that have been added recently`,
        );
      }
      this.availableFunctions.set(name, normalizedFunc);
    });

    return true;
  }

  getCustomFunction(functionName: string): CustomJSFunction | undefined;
  getCustomFunction(functionName: string[]): (CustomJSFunction | undefined)[];
  getCustomFunction(functionName: string | string[]) {
    const functionNames = Array.isArray(functionName)
      ? functionName
      : [functionName];
    if (!functionNames.length) {
      throw new AoijsTypeError("You did not specify the 'name' parameter");
    }

    return functionNames.length > 1
      ? functionNames.map((name) => this.availableFunctions.get(name))
      : this.availableFunctions.get(functionNames[0]);
  }

  hasCustomFunction(functionName: string): boolean;
  hasCustomFunction(
    functionName: string[],
  ): { name: string; result: boolean }[];
  hasCustomFunction(functionName: string | string[]) {
    if (Array.isArray(functionName)) {
      return functionName.map((fun) => ({
        name: fun,
        result: this.availableFunctions.has(fun),
      }));
    } else if (typeof functionName === "string") {
      return this.availableFunctions.has(functionName);
    } else {
      throw new AoijsTypeError(
        `The specified type should be "string | string[]"`,
      );
    }
  }

  get countCustomFunction() {
    return this.availableFunctions.size;
  }

  private validateAndNormalizeFunction(func: DataFunction | AoiFunction): {
    name: string;
    normalizedFunc: CustomJSFunction;
  } {
    const functionName = func?.name?.toLowerCase();
    if (!functionName) {
      throw new AoijsTypeError("You did not specify the 'name' parameter");
    }

    if ((func?.version || 0) > version) {
      throw new AoijsTypeError(
        `To load this function '${functionName}', the library version must be equal to or greater than ${func?.version || 0}`,
      );
    }

    let normalizedFunc: CustomJSFunction = {} as CustomJSFunction;

    if (func.type === "aoitelegram") {
      normalizedFunc = {
        name: functionName,
        version: func.version,
        aliases: func.aliases,
        brackets: func.params?.length! > 0,
        fields: func.params
          ? func.params.map((name) => ({
              name: name.replace("?", "").replace("...", ""),
              required: !name.endsWith("?"),
              rest: name.startsWith("..."),
            }))
          : [],
        callback: async (ctx, fun) => {
          const result = await this.telegram.evaluateCommand(
            {
              name: func.name,
              reverseReading: func.reverseReading,
              code: func.code,
            },
            ctx.eventData,
          );
          return fun.resolve(result);
        },
      };
    } else {
      normalizedFunc = func as unknown as CustomJSFunction;
    }

    return { name: functionName, normalizedFunc };
  }

  private addCustomFunction(func: DataFunction | AoiFunction) {
    const { name, normalizedFunc } = this.validateAndNormalizeFunction(func);

    if (this.availableFunctions.has(name)) {
      throw new AoijsTypeError(
        `The function '${name}' already exists; to overwrite it, use the <AoiClient>.editFunction method!`,
      );
    }

    this.availableFunctions.set(name, normalizedFunc);
  }
}

export { CustomFunctionManager };
