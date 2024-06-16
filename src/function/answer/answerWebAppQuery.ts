import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$answerWebAppQuery")
  .setBrackets(true)
  .setFields({
    name: "web_app_query_id",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "result",
    required: true,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [web_app_query_id, result] = await func.resolveFields(context);

    const sentWebAppMessage = await context.telegram.answerWebAppQuery(
      web_app_query_id,
      result,
    );

    return func.resolve(sentWebAppMessage);
  });
