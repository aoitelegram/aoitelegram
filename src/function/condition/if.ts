import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$if")
  .setBrackets(true)
  .setFields({ required: true })
  .onCallback(async (context, func, code) => {
    if (!code) {
      return func.reject("I don't have access to the code");
    }
    const condition = await func.resolveAllFields(context);
    if (context.condition.checkCondition(condition)) {
      for (const structures of func.ifContent) {
        const result = await structures.callback(context, structures, code);
        if ("reason" in result) {
          return func.reject(result.reason);
        }
        code = code.replace(result.id, result.with);
      }
    }
    return func.resolve("", code);
  });
