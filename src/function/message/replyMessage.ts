import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$replyMessage")
  .setBrackets(true)
  .setFields({
    name: "text",
    rest: true,
    type: [ArgsType.Any],
    required: true,
  })
  .onCallback(async (context, func) => {
    const text = await func.resolveAllFields(context);
    await context.eventData.reply(text, context.getMessageOptions());
    return func.resolve();
  });
