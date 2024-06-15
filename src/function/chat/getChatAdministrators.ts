import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getChatAdministrators")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .onCallback(async (context, func) => {
    const [chat_id] = await func.resolveFields(context);

    const result = await context.telegram.getChatAdministrators(chat_id);
    return func.resolve(result);
  });
