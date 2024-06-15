import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$editGeneralForumTopic")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [chat_id, name] = await func.resolveFields(context);
    const result = await context.telegram.editGeneralForumTopic(chat_id, name);
    return func.resolve(result);
  });
