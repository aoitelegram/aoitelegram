import { Container } from "./Container";
import type { Context } from "./Context";
import { AoijsTypeError } from "../AoiError";
import type { ICommandsOptions } from "../AoiBase";
import type { Collection } from "@telegram.ts/collection";
import type { ContextEvent } from "../AoiTyping";

class Interpreter {
  container: Container;
  inputData: ICommandsOptions & {
    functions: Collection<string, Context>;
  };

  constructor(
    inputData: ICommandsOptions & {
      functions: Collection<string, Context>;
    },
    ctx: ContextEvent,
  ) {
    this.inputData = inputData;
    this.container = new Container(ctx);
  }

  async runInput(reverseReading?: boolean) {
    let textResult = this.inputData.code;
    const reverseFunctions = reverseReading
      ? this.inputData.functions.toReversed()
      : this.inputData.functions;

    for await (const [name, func] of reverseFunctions) {
      try {
        const result = await func.callback(Object.assign(func, this.container));
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
