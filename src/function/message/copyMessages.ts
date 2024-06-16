import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$copyMessages")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "from_chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_ids",
    required: true,
    type: [ArgsType.Array],
  })
  .setFields({
    name: "message_thread_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "disable_notification",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "protect_content",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "remove_caption",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [
      chat_id,
      from_chat_id,
      message_ids,
      message_thread_id,
      disable_notification,
      protect_content,
      remove_caption,
    ] = await func.resolveFields(context);

    const result = await context.telegram.copyMessages({
      chat_id,
      message_thread_id,
      from_chat_id,
      message_ids,
      disable_notification,
      protect_content,
      remove_caption,
    });

    return func.resolve(result);
  });
