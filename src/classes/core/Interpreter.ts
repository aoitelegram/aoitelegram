import { Container } from "./Container";
import type { ContextEvent } from "../AoiTyping";
import type { ParserFunction } from "./ParserFunction";
import { RuntimeError, AoijsTypeError } from "../AoiError";
import type { ErrorCompiler, SuccessCompiler } from "./Compiler";

class Interpreter {
  public readonly container: Container;
  public readonly inputData: SuccessCompiler | ErrorCompiler;

  constructor(inputData: SuccessCompiler | ErrorCompiler, ctx: ContextEvent) {
    this.inputData = inputData;
    this.container = new Container(ctx, inputData as SuccessCompiler);
  }

  async runInput(): Promise<string> {
    if ("description" in this.inputData) {
      await this.#sendErrorMessage(
        this.inputData.description,
        this.inputData.func,
        false,
        {
          code: this.inputData.errorCode,
          line: this.inputData.line,
        },
      );
      return "";
    }

    let textResult = this.inputData.code;

    const functions = this.extractIfBlocks(this.inputData.functions);

    for await (const dataFunction of functions || []) {
      try {
        const result = await dataFunction.callback(
          this.container,
          dataFunction,
          textResult,
        );
        if (typeof result !== "object") {
          throw new AoijsTypeError(
            `The function "${
              dataFunction.structures.name
            }" should return an object with the required values, but it received type: ${typeof result}.`,
          );
        }

        if (this.container.stopCode === true) break;

        if ("reason" in result) {
          if (result.reason) {
            await this.#sendErrorMessage(
              result.reason,
              dataFunction.structures.name,
              result.custom,
            );
          }
          break;
        }
        textResult = "code" in result && result.code ? result.code : textResult;
        textResult = textResult.replace(result.id, result.with);
      } catch (err) {
        if (this.container.stopCode === true) break;

        if (err instanceof AoijsTypeError) {
          const errorMessage = `${err}`.split(":").slice(1).join(" ");
          await this.#sendErrorMessage(
            errorMessage.trimLeft(),
            err?.errorFunction
              ? err.errorFunction
              : dataFunction.structures.name,
          );
        } else {
          await this.#sendErrorMessage(`${err}`, dataFunction.structures.name);
        }
        break;
      }
    }
    return textResult;
  }

  extractIfBlocks(
    structures: SuccessCompiler["functions"],
  ): SuccessCompiler["functions"] | void {
    const stack: SuccessCompiler["functions"] = [];
    const result: SuccessCompiler["functions"] = [];

    for (const func of structures) {
      const name = func.structures.name.toLowerCase();

      if (name === "$if") {
        func.ifContent = [];
        stack.push(func);
      } else if (name === "$elseif") {
        if (stack.length === 0) {
          this.#sendErrorMessage(
            "$elseIf cannot be used until $if is declared",
            "$elseIf",
          );
        } else if (stack[stack.length - 1]?.elseProcessed) {
          this.#sendErrorMessage(
            "Cannot use $elseIf after $else has been used",
            "$elseIf",
          );
        } else {
          stack[stack.length - 1].elseIfProcessed = true;
          stack[stack.length - 1].elseIfContent.push(func);
        }
      } else if (name === "$else") {
        if (stack.length === 0) {
          this.#sendErrorMessage(
            "$else cannot be used until $if is declared",
            "$else",
          );
        } else {
          stack[stack.length - 1].elseProcessed = true;
        }
      } else if (name === "$endif") {
        const ifStructure = stack.pop();
        if (!ifStructure) {
          this.#sendErrorMessage("No matching $if found for $endIf", "$endIf");
          return;
        }
        if (stack.length > 0) {
          stack[stack.length - 1].ifContent.push(ifStructure);
        } else {
          result.push(ifStructure);
        }
      } else {
        if (stack.length > 0) {
          const currentStructure = stack[stack.length - 1];
          if (currentStructure.elseProcessed) {
            currentStructure.elseContent.push(func);
          } else if (currentStructure.elseIfProcessed) {
            currentStructure.elseIfContent.push(func);
          } else {
            currentStructure.ifContent.push(func);
          }
        } else {
          result.push(func);
        }
      }
    }

    if (stack.length > 0) {
      this.#sendErrorMessage("Unclosed $if blocks found", "$if");
      return;
    }

    return result;
  }

  async #sendErrorMessage(
    error: string,
    functionName: string,
    custom: boolean = false,
    options: { code?: string; line?: number } = {},
  ): Promise<void> {
    const { container } = this;
    const { suppressErrors, telegram, eventData } = container || {};
    const { functionError, sendMessageError } = telegram || {};

    const shouldEmitFunctionError = !custom && !suppressErrors && functionError;
    const shouldSendMessage =
      !custom && typeof suppressErrors === "string" && eventData?.reply;
    const shouldSendErrorMessage =
      sendMessageError && !functionError && eventData?.reply;
    const shouldThrowRuntimeError = !functionError;

    if (shouldEmitFunctionError) {
      telegram.emit("functionError", container, {
        errorMessage: error,
        functionName,
        ...this.inputData,
      });
    } else if (shouldSendMessage) {
      await eventData.sendMessage(suppressErrors, { parse_mode: "HTML" });
      return;
    } else if (shouldSendErrorMessage) {
      const message = custom
        ? error
        : `❌ <b>${functionName}:</b> <code>${error}</code>`;
      await eventData.sendMessage(message, { parse_mode: "HTML" });
      return;
    } else if (shouldThrowRuntimeError) {
      throw new RuntimeError(error, {
        line: options.line,
        code: options.code,
        errorFunction: functionName,
      });
    }
  }
}

export { Interpreter };
