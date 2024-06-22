import { Container } from "./Container";
import type { ContextEvent } from "../AoiTyping";
import type { ParserFunction } from "./ParserFunction";
import { RuntimeError, AoijsTypeError } from "../AoiError";
import {
  SymbolDescription,
  type ErrorCompiler,
  type SuccessCompiler,
} from "./Compiler";

class Interpreter {
  public readonly container: Container;
  public readonly inputData: SuccessCompiler | ErrorCompiler;

  constructor(inputData: SuccessCompiler | ErrorCompiler, ctx: ContextEvent) {
    this.inputData = inputData;
    this.container = new Container(ctx, inputData as SuccessCompiler);
  }

  async runInput(): Promise<string> {
    if (SymbolDescription in this.inputData) {
      await this.sendErrorMessage(
        this.inputData[SymbolDescription],
        this.inputData.func,
        {
          code: this.inputData.errorCode,
          line: this.inputData.line,
        },
      );
      return "";
    }

    let textResult = this.inputData.code;

    for await (const dataFunction of this.inputData.functions) {
      try {
        const result = await dataFunction.callback(
          this.container,
          dataFunction,
          textResult,
        );

        if (typeof result !== "object") {
          throw new AoijsTypeError(
            `The function "${dataFunction.structures.name}" should return an object with the required values, but it received type: ${typeof result}.`,
          );
        }

        if (dataFunction.structures.name === "$return") {
          return "with" in result ? result.with : "";
        }

        if (this.container.stopCode) break;

        if ("reason" in result) {
          if (dataFunction.isSilentFunction) {
            textResult = textResult.replace(result.id, "undefined");
            continue;
          }
          if (result.reason) {
            await this.sendErrorMessage(
              result.reason,
              dataFunction.structures.name,
              { custom: result.custom },
            );
          }
          break;
        }

        textResult = result.code ? result.code : textResult;
        textResult = textResult.replace(result.id, result.with);
      } catch (err) {
        if (dataFunction.isSilentFunction) {
          this.container.stopCode = false;
          textResult = textResult.replace(dataFunction.id, "undefined");
          continue;
        }

        if (this.container.stopCode) break;

        if (err instanceof AoijsTypeError) {
          const errorMessage = `${err}`.split(":").slice(1).join(" ");
          await this.sendErrorMessage(
            errorMessage.trimLeft(),
            err.errorFunction || dataFunction.structures.name,
            { custom: err.customError },
          );
        } else {
          await this.sendErrorMessage(`${err}`, dataFunction.structures.name);
        }
        break;
      }
    }

    return textResult;
  }

  async sendErrorMessage(
    error: string,
    functionName: string,
    options: { custom?: boolean; code?: string; line?: number } = {},
  ): Promise<void> {
    const { container } = this;
    const { suppressErrors, telegram, eventData } = container || {};
    const { functionError, sendMessageError } = telegram || {};
    const { custom = false, code, line } = options;

    if (!custom && !suppressErrors && functionError) {
      telegram.emit("functionError", container, {
        errorMessage: error,
        functionName,
        ...this.inputData,
      });
    } else if (
      !custom &&
      "reply" in eventData &&
      typeof suppressErrors === "string"
    ) {
      await eventData.sendMessage(suppressErrors, { parse_mode: "HTML" });
    } else if (sendMessageError && !functionError && "reply" in eventData) {
      const message = custom
        ? error
        : `❌ <b>${functionName}:</b> <code>${error}</code>`;
      await eventData.sendMessage(message, { parse_mode: "HTML" });
    } else if (!functionError) {
      throw new RuntimeError(error, {
        line,
        code,
        errorFunction: functionName,
      });
    }
  }
}

export { Interpreter };
