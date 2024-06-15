import { ReplyParametersID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setReplyParameters")
  .setBrackets(true)
  .setFields({
    name: "messageId",
    type: [ArgsType.Number],
    required: true,
  })
  .setFields({
    name: "chatId",
    type: [ArgsType.Number, ArgsType.String],
    required: false,
  })
  .setFields({
    name: "allowSendingWithoutReply",
    type: [ArgsType.Boolean],
    required: false,
  })
  .setFields({
    name: "quote",
    type: [ArgsType.String],
    required: false,
  })
  .setFields({
    name: "quoteParseMode",
    type: [ArgsType.String],
    required: false,
  })
  .setFields({
    name: "quoteEntities",
    type: [ArgsType.Array],
    required: false,
  })
  .setFields({
    name: "quotePosition",
    type: [ArgsType.Number],
    required: false,
  })
  .onCallback(async (context, func) => {
    const [
      message_id,
      chat_id,
      allow_sending_without_reply,
      quote,
      quote_parse_mode,
      quote_entities,
      quote_position,
    ] = await func.resolveFields(context);
    const replyParameters = context.variable.get(ReplyParametersID);

    replyParameters.message_id = message_id || replyParameters.message_id;
    replyParameters.chat_id = chat_id || replyParameters.chat_id;
    replyParameters.allow_sending_without_reply =
      allow_sending_without_reply ||
      replyParameters.allow_sending_without_reply;
    replyParameters.quote = quote || replyParameters.quote;
    replyParameters.quote_parse_mode =
      quote_parse_mode || replyParameters.quote_parse_mode;
    replyParameters.quote_entities =
      quote_entities || replyParameters.quote_entities;
    replyParameters.quote_position =
      quote_position || replyParameters.quote_position;

    context.variable.set(ReplyParametersID, replyParameters);
    return func.resolve();
  });
