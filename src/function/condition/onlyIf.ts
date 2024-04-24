import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$onlyIf")
  .setBrackets(true)
  .setFields({ required: true })
  .setFields({ required: true })
  .onCallback(async (context, func) => {
    func.checkArguments();

    const [condition] = await func.resolveFields(context, [0]);
    if (!context.condition.checkCondition(condition)) {
      const [reason] = await func.resolveFields(context, [1]);
      return func.reject(reason, true);
    }
    return func.resolve();
  });
