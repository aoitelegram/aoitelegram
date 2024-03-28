import { Container } from "./Container";
import { Context } from "./Context";
import { AoijsTypeError } from "../AoiError";
import { Collection } from "@telegram.ts/collection";
import type { LibWithDataFunction, ContextEvent } from "../AoiTyping";

interface IInterpreterOptions {
  code: string;
  functions: Context[];
  useNative?: Function[];
}

class Interpreter {
  container: Container;
  inputData: IInterpreterOptions;

  constructor(inputData: IInterpreterOptions, ctx: ContextEvent) {
    this.inputData = inputData;
    this.container = new Container(ctx);
  }

  async runInput(reverseReading: boolean) {
    let textResult = this.inputData.code;
    const reverseFunctions = reverseReading
      ? this.inputData.functions.toReversed()
      : this.inputData.functions;

    for await (const [name, func] of reverseFunctions) {
      try {
        const result = await func.callback(this.container, func);
        if (typeof result !== "object") {
          throw new AoijsTypeError(
            `The function "${name}" should return an object with the required values, but it received type: ${typeof result}.`,
          );
        }
        textResult = textResult.replace(result.id, result.with);
      } catch (err) {
        console.log(err);
        break;
      }
    }
    return textResult;
  }
}

export { Interpreter };
