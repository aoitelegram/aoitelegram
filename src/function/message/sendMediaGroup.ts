import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendMediaGroup")
  .setBrackets(true)
  .setFields({
    name: "business_connection_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_thread_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "media",
    required: true,
    type: [ArgsType.Array],
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
    name: "message_effect_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [
      business_connection_id,
      chat_id,
      message_thread_id,
      media,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    media.map((item: any) => {
      const variableFile = context.variable.get(FileAnswerID);
      if (item.media?.startsWith("http")) {
        item.media = item.media;
      } else {
        if (!variableFile?.[item.media] && !item.media?.startsWith("http")) {
          throw new Error(
            `The specified variable "${item.media}" does not exist for the file`,
          );
        }
      }
      if ("thumbnail" in item && item.thumbnail?.startsWith("http")) {
        item.thumbnail = item.thumbnail;
      } else item.thumbnail = variableFile[item.thumbnail];

      return item;
    });

    const result = await context.telegram.sendMediaGroup({
      business_connection_id,
      chat_id,
      message_thread_id,
      media,
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
    });

    return func.resolve(result);
  });
