import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$answerPreCheckoutQuery")
  .setBrackets(true)
  .setFields({
    name: "pre_checkout_query_id",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "ok",
    required: true,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "error_message",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [pre_checkout_query_id, ok, error_message] =
      await func.resolveFields(context);

    await context.telegram.answerPreCheckoutQuery({
      pre_checkout_query_id,
      ok,
      error_message,
    });

    return func.resolve(true);
  });
