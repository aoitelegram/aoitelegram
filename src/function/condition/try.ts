import { SymbolID } from "../index";
import { AoiFunction } from "@structures/AoiFunction";
import { AoijsTypeError } from "@structures/AoiError";
import type { Container } from "@structures/core/Container";
import type { ParserFunction } from "@structures/core/ParserFunction";

async function processContent(
  content: ParserFunction[],
  context: Container,
  code: string,
  func: ParserFunction,
) {
  for (const item of content) {
    const result = await item.callback(context, item, code);
    if ("reason" in result) {
      return { reason: result.reason };
    }
    code = code.replace(result.id, result.with);
  }
  return { code };
}

export default new AoiFunction()
  .setName("$try")
  .setBrackets(false)
  .onCallback(async (context, func, code) => {
    if (!code) {
      return func.reject("I don't have access to the code");
    }

    if (func.catchContent.length > 0) {
      const catchFunction = func.catchContent.shift();
      if (catchFunction) {
        await catchFunction.callback(context, catchFunction);
      }
    }

    for (const tryFunc of func.tryContent) {
      try {
        const result = await tryFunc.callback(context, tryFunc, code);
        if ("reason" in result) {
          context.variable.set(context.variable.get(SymbolID), {
            description: result.reason,
            errorFunction: tryFunc.structures.name,
          });
          const catchResult = await processContent(
            func.catchContent,
            context,
            code,
            func,
          );
          if ("reason" in catchResult) {
            return func.reject(catchResult.reason);
          }
          code = catchResult.code;
        } else {
          code = code.replace(result.id, result.with);
        }
      } catch (err) {
        context.variable.set(context.variable.get(SymbolID), {
          description:
            err instanceof AoijsTypeError ? err.description : `${err}`,
          errorFunction:
            err instanceof AoijsTypeError
              ? err.errorFunction
              : tryFunc.structures.name,
        });
        const catchResult = await processContent(
          func.catchContent,
          context,
          code,
          func,
        );
        if ("reason" in catchResult) {
          return func.reject(catchResult.reason);
        }
        code = catchResult.code;
      }
    }

    return func.resolve();
  });
