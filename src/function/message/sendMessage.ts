import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$replyMessage")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
  })
  .onCallback(async (context) => {
    const [text] = await context.resolveArray(context);
    await context.eventData.reply(text);
    return context.resolve("");
  });
