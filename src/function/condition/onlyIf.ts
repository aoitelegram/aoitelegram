import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$onlyIf")
  .setBrackets(true)
  .setFields({ required: true })
  .setFields({ required: true })
  .onCallback(async (context, func) => {
    const condition = await func.resolveCode(context, func.fields[0]);
    if (!context.condition.checkCondition(condition)) {
      const reason = await func.resolveCode(context, func.fields[1]);
      return func.reject(reason, true);
    }
    return func.resolve();
  });
