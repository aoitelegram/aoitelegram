import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$print")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
  })
  .onCallback(async (context, func) => {
    console.log(await func.resolveAll(context));
    return func.resolve("");
  });
