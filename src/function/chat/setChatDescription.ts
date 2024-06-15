import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatDescription")
  .setBrackets(true)
  .setFields({
    name: "description",
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
    const [description, chat_id] = await func.resolveFields(context);

    const result = await context.telegram.setChatDescription(
      chat_id,
      description,
    );
    return func.resolve(result);
  });
