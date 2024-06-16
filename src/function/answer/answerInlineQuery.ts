import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$answerInlineQuery")
  .setBrackets(true)
  .setFields({
    name: "inline_query_id",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "results",
    required: true,
    type: [ArgsType.Array],
  })
  .setFields({
    name: "cache_time",
    required: false,
    type: [ArgsType.Time],
    defaultValue: { ms: 300 },
  })
  .setFields({
    name: "is_personal",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "next_offset",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "button",
    required: false,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [
      inline_query_id,
      results,
      cache_time,
      is_personal,
      next_offset,
      button,
    ] = await func.resolveFields(context);

    const result = await context.telegram.answerInlineQuery({
      inline_query_id,
      results,
      cache_time: cache_time?.ms,
      is_personal,
      next_offset,
      button,
    });

    return func.resolve(result);
  });
