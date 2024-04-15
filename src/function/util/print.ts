import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$print")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
  })
  .onCallback(async (context, func) => {
    console.log(await func.resolveAllFields(context));
    return func.resolve("");
  });
