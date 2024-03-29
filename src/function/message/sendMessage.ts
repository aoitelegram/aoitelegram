import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$replyMessage")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
  })
  .onCallback(async (ctx, func) => {
    const [text] = await func.resolveArray(ctx);
    await ctx.eventData.reply(text);
    return func.resolve("");
  });
