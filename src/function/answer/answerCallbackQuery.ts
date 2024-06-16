import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$answerCallbackQuery")
  .setBrackets(true)
  .setFields({
    name: "callback_query_id",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "text",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "show_alert",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "url",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "cache_time",
    required: false,
    type: [ArgsType.Time],
  })
  .onCallback(async (context, func) => {
    const [callback_query_id, text, show_alert, url, cache_time] =
      await func.resolveFields(context);

    const result = await context.telegram.answerCallbackQuery({
      callback_query_id,
      text,
      show_alert,
      url,
      cache_time: cache_time?.ms,
    });

    return func.resolve(result);
  });
