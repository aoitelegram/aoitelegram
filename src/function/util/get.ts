import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$get")
  .setBrackets(true)
  .setFields({ required: true })
  .onCallback(async (context, func) => {
    func.checkArguments();

    const [name] = await func.resolveFields(context);
    return func.resolve(context.variable.get(name));
  });
