import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatTitle")
  .setBrackets(true)
  .setFields({
    name: "title",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .onCallback(async (context, func) => {
    const [title, chat_id] = await func.resolveFields(context);

    const result = await context.telegram.setChatTitle(chat_id, title);
    return func.resolve(result);
  });
