import { Container } from "./Container";
import type { ContextEvent } from "../AoiTyping";
import type { ParserFunction } from "./ParserFunction";
import { RuntimeError, AoijsTypeError } from "../AoiError";
import { getObjectKey, removePattern } from "../../utils/";
import type { ErrorCompiler, SuccessCompiler } from "./Compiler";

class Interpreter {
  public readonly container: Container;
  public readonly inputData: SuccessCompiler | ErrorCompiler;

  constructor(inputData: SuccessCompiler | ErrorCompiler, ctx: ContextEvent) {
    this.inputData = inputData;
    this.container = new Container(ctx);
  }

  async runInput(): Promise<string> {
    if ("description" in this.inputData) {
      await this.#sendErrorMessage(
        this.inputData.description,
        removePattern(this.inputData.func),
        false,
        {
          code: this.inputData.errorCode.split("\n")[this.inputData.line],
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
              removePattern(dataFunction.structures.name),
              result.custom,
            );
          }
          break;
        }
        textResult = "code" in result && result.code ? result.code : textResult;
        textResult = textResult.replace(result.id, result.with);
      } catch (err) {
        if (err instanceof AoijsTypeError) {
          const errorMessage = `${err}`.split(":").slice(1).join(" ");
          await this.#sendErrorMessage(
            errorMessage,
            removePattern(dataFunction.structures.name),
          );
        } else {
          await this.#sendErrorMessage(
            `${err}`,
            removePattern(dataFunction.structures.name),
          );
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
      const structure = func.structures;

      if (removePattern(structure.name) === "$if") {
        func.ifContent = [];
        stack.push(func);
      } else if (removePattern(structure.name) === "$else") {
        if (stack.length > 0) {
          stack[stack.length - 1].elseProcessed = true;
        }
      } else if (removePattern(structure.name) === "$endif") {
        const ifStructure = stack.pop();
        if (!ifStructure) {
          this.#sendErrorMessage("No matching $if found for $endif", "$endif");
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
    options?: { code: string; line: number },
  ): Promise<void> {
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
          const options = await func.resolveAllFields(context);

          const dataError = {
            name: functionName,
            command: "name" in this.inputData ? this.inputData.name : null,
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
      typeof this.container?.suppressErrors === "string" &&
      "reply" in this.container.eventData
    ) {
      await this.container.eventData.sendMessage(
        this.container.suppressErrors,
        {
          parse_mode: "HTML",
        },
      );
      return;
    } else if (
      this.container?.telegram?.sendMessageError &&
      !this.container?.telegram?.functionError &&
      "reply" in this.container.eventData
    ) {
      await this.container.eventData.sendMessage(
        custom ? error : `❌ <b>${functionName}:</b> <code>${error}</code>`,
        { parse_mode: "HTML" },
      );
      return;
    } else if (!this.container?.telegram?.functionError) {
      throw new RuntimeError(error, options?.line, options?.code);
    }
  }
}

export { Interpreter };
