import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$reopenForumTopic")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_thread_id",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [chat_id, message_thread_id] = await func.resolveFields(context);
    const result = await context.telegram.reopenForumTopic(
      chat_id,
      message_thread_id,
    );
    return func.resolve(result);
  });
