import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$replyMessage")
  .setBrackets(true)
  .setFields({
    name: "text",
    rest: true,
    type: [ArgsType.String],
    required: true,
  })
  .onCallback(async (context, func) => {
    const text = await func.resolveAllFields(context);
    await context.eventData.reply(text);
    return func.resolve("");
  });
