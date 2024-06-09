import { AoiFunction, ArgsType } from "@structures/AoiFunction";
import type { ParserFunction } from "@core/ParserFunction";

function groupFunctionsByName(functions: ParserFunction[]): ParserFunction[][] {
  const groupedFunctions: ParserFunction[][] = [];
  let currentGroup: ParserFunction[] = [];

  functions.forEach((func) => {
    if (func.structures.name === "$elseIf") {
      if (currentGroup.length > 0) {
        groupedFunctions.push(currentGroup);
        currentGroup = [];
      }
    }
    currentGroup.push(func);
  });

  if (currentGroup.length > 0) {
    groupedFunctions.push(currentGroup);
  }

  return groupedFunctions;
}

export default new AoiFunction()
  .setName("$if")
  .setBrackets(true)
  .setFields({ name: "condition", type: [ArgsType.Any], required: true })
  .onCallback(async (context, func, code) => {
    if (!code) {
      return func.reject("I don't have access to the code");
    }
    const resolvedArgs = await func.resolveAllFields(context);
    const condition = context.condition.checkCondition(resolvedArgs);

    let allFunctions: ParserFunction[] = [];

    if (condition === true) {
      allFunctions = func.ifContent;
    } else if (condition === false && func.elseIfProcessed) {
      for (const conditionsGroup of groupFunctionsByName(func.elseIfContent)) {
        if (
          context.condition.checkCondition(
            await conditionsGroup[0].resolveAllFields(context),
          )
        ) {
          allFunctions = conditionsGroup.slice(1);
          break;
        }
      }
      if (allFunctions.length < 1 && func.elseProcessed) {
        allFunctions = func.elseContent;
      }
    } else if (condition === false && func.elseProcessed) {
      allFunctions = func.elseContent;
    }

    for (const func of allFunctions) {
      const result = await func.callback(context, func, code);
      if ("reason" in result) {
        return func.reject(result.reason);
      }
      code = code.replace(result.id, result.with);
    }
    return func.resolve("", code);
  });
