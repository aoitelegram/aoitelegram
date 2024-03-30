import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$print")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
  })
  .onCallback(async (context) => {
    const text = await context.resolveArray(context);
    console.log(...text);
    return context.resolve("");
  });
