import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$answerShippingQuery")
  .setBrackets(true)
  .setFields({
    name: "shipping_query_id",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "ok",
    required: true,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "shipping_options",
    required: false,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "error_message",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [shipping_query_id, ok, shipping_options, error_message] =
      await func.resolveFields(context);

    await context.telegram.answerShippingQuery({
      shipping_query_id,
      ok,
      shipping_options,
      error_message,
    });

    return func.resolve(true);
  });
