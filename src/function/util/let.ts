import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$let")
  .setBrackets(true)
  .setFields({ required: true })
  .setFields({ required: true })
  .onCallback(async (context, func) => {
    func.checkArguments();

    const [name, value] = await func.resolveFields(context);
    context.variable.set(name, value);
    return func.resolve();
  });
