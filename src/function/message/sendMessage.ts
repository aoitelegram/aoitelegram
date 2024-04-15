import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$replyMessage")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
  })
  .onCallback(async (context, func) => {
    const text = await func.resolveAllFields(context);
    await context.eventData.reply(text);
    return func.resolve("");
  });
