import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendPoll")
  .setBrackets(true)
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
    name: "question",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "question_parse_mode",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "question_entities",
    required: false,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "options",
    required: true,
    type: [ArgsType.Array],
  })
  .setFields({
    name: "is_anonymous",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "type",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "allows_multiple_answers",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "correct_option_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "explanation",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "explanation_parse_mode",
    required: false,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "explanation_entities",
    required: false,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "open_period",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "close_date",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "is_closed",
    required: false,
    type: [ArgsType.Boolean],
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
      chat_id,
      message_thread_id,
      question,
      question_parse_mode,
      question_entities,
      options,
      is_anonymous,
      type,
      allows_multiple_answers,
      correct_option_id,
      explanation,
      explanation_parse_mode,
      explanation_entities,
      open_period,
      close_date,
      is_closed,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const result = await context.telegram.sendPoll({
      chat_id,
      message_thread_id,
      question,
      question_parse_mode,
      question_entities,
      options,
      is_anonymous,
      type,
      allows_multiple_answers,
      correct_option_id,
      explanation,
      explanation_parse_mode,
      explanation_entities,
      open_period,
      close_date,
      is_closed,
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
