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
      await this.sendErrorMessage(
        this.inputData.description,
        this.inputData.func,
        {
          code: this.inputData.errorCode,
          line: this.inputData.line,
        },
      );
      return "";
    }

    let textResult = this.inputData.code;

    let functions = this.extractIfBlocks(this.inputData.functions);
    if (Array.isArray(functions)) {
      functions = this.extractTryCatchBlocks(functions) || [];
    }

    for await (const dataFunction of functions || []) {
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

        if (this.container.stopCode) break;

        if ("reason" in result) {
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
        if (this.container.stopCode) break;

        if (err instanceof AoijsTypeError) {
          const errorMessage = `${err}`.split(":").slice(1).join(" ");
          await this.sendErrorMessage(
            errorMessage.trimLeft(),
            err.errorFunction || dataFunction.structures.name,
          );
        } else {
          await this.sendErrorMessage(`${err}`, dataFunction.structures.name);
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
          this.sendErrorMessage(
            "$elseIf cannot be used until $if is declared",
            "$elseIf",
          );
        } else if (stack[stack.length - 1]?.elseProcessed) {
          this.sendErrorMessage(
            "Cannot use $elseIf after $else has been used",
            "$elseIf",
          );
        } else {
          stack[stack.length - 1].elseIfProcessed = true;
          stack[stack.length - 1].elseIfContent.push(func);
        }
      } else if (name === "$else") {
        if (stack.length === 0) {
          this.sendErrorMessage(
            "$else cannot be used until $if is declared",
            "$else",
          );
        } else {
          stack[stack.length - 1].elseProcessed = true;
        }
      } else if (name === "$endif") {
        const ifStructure = stack.pop();
        if (!ifStructure) {
          this.sendErrorMessage("No matching $if found for $endIf", "$endIf");
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
      this.sendErrorMessage("Unclosed $if blocks found", "$if");
      return;
    }

    for (let i = 0; i < result.length; i++) {
      result[i].ifContent =
        this.extractTryCatchBlocks(result[i].ifContent) || [];
      result[i].elseContent =
        this.extractTryCatchBlocks(result[i].elseContent) || [];
      result[i].elseIfContent =
        this.extractTryCatchBlocks(result[i].elseIfContent) || [];
    }

    return result;
  }

  extractTryCatchBlocks(
    structures: SuccessCompiler["functions"],
  ): SuccessCompiler["functions"] | void {
    const stack: SuccessCompiler["functions"] = [];
    const result: SuccessCompiler["functions"] = [];

    for (const func of structures) {
      const name = func.structures.name.toLowerCase();

      if (name === "$try") {
        func.tryContent = [];
        stack.push(func);
      } else if (name === "$catch") {
        if (stack.length > 0) {
          stack[stack.length - 1].catchProcessed = true;
          stack[stack.length - 1].catchContent.push(func);
        }
      } else if (name === "$endtry") {
        const tryStructure = stack.pop();
        if (!tryStructure) {
          this.sendErrorMessage(
            "No matching $try found for $endTry",
            "$endTry",
          );
          return;
        }
        if (stack.length > 0) {
          stack[stack.length - 1].tryContent.push(tryStructure);
        } else {
          result.push(tryStructure);
        }
      } else {
        if (stack.length > 0) {
          const currentStructure = stack[stack.length - 1];
          if (currentStructure.catchProcessed) {
            currentStructure.catchContent.push(func);
          } else {
            currentStructure.tryContent.push(func);
          }
        } else {
          result.push(func);
        }
      }
    }

    if (stack.length > 0) {
      this.sendErrorMessage("Unclosed $try blocks found", "$try");
      return;
    }

    return result;
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
