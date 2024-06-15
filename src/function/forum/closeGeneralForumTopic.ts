import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$closeGeneralForumTopic")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .onCallback(async (context, func) => {
    const [chat_id] = await func.resolveFields(context);
    const result = await context.telegram.closeGeneralForumTopic(chat_id);
    return func.resolve(result);
  });
