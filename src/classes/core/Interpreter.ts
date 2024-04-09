import { Container } from "./Container";
import { getObjectKey } from "../../utils/";
import { AoijsTypeError } from "../AoiError";
import type { ContextEvent } from "../AoiTyping";
import type { ParserFunction } from "./ParserFunction";

class Interpreter {
  container: Container;
  inputData: Record<string, any> & {
    functions: ParserFunction[];
  };

  constructor(
    inputData: Record<string, any> & {
      functions: ParserFunction[];
    },
    ctx: ContextEvent,
  ) {
    this.inputData = inputData;
    this.container = new Container(ctx);
  }

  async runInput() {
    let textResult = this.inputData.code;

    for await (const dataFunction of this.inputData.functions) {
      try {
        const result = await dataFunction.structures.callback(
          this.container,
          dataFunction,
        );
        if (typeof result !== "object") {
          throw new AoijsTypeError(
            `The function "${
              dataFunction.structures.name
            }" should return an object with the required values, but it received type: ${typeof result}.`,
          );
        }

        if ("reason" in result) {
          if (result.reason) {
            this.#sendErrorMessage(
              result.reason,
              dataFunction.structures.name,
              result.custom,
            );
          }
          break;
        }

        textResult = textResult.replace(result.id, result.with);
      } catch (err) {
        this.#sendErrorMessage(`${err}`, dataFunction.structures.name);
        break;
      }
    }
    return textResult;
  }

  #sendErrorMessage(
    error: string,
    functionName: string,
    custom: boolean = false,
  ) {
    if (
      !custom &&
      !this.container?.suppressErrors &&
      this.container?.telegram?.functionError
    ) {
      this.container.telegram.ensureCustomFunction({
        name: "$handleerror",
        brackets: true,
        fields: [
          {
            required: false,
          },
        ],
        callback: async (context, func) => {
          const options = await func.resolveAll(context);

          const dataError = {
            name: functionName,
            command: this.inputData.name,
            error,
          };
          const result = getObjectKey(dataError, options);
          return func.resolve(result);
        },
      });
      this.container.telegram.emit(
        "functionError",
        this.container.eventData,
        this.container.telegram,
      );
    }

    if (
      !custom &&
      this.container?.suppressErrors &&
      this.container.eventData?.sendMessage
    ) {
      return this.container.eventData.sendMessage(
        this.container.suppressErrors,
        {
          parse_mode: "HTML",
        },
      );
    } else if (
      this.container?.telegram?.sendMessageError &&
      !this.container?.telegram?.functionError &&
      this.container.eventData?.sendMessage
    ) {
      return this.container.eventData.sendMessage(
        custom ? error : `❌ <b>${functionName}:</b> <code>${error}</code>`,
        { parse_mode: "HTML" },
      );
    } else if (!this.container?.telegram?.functionError) {
      throw new AoijsTypeError(error);
    }
  }
}

export { Interpreter };
