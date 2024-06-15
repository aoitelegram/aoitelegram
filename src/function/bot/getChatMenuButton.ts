import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getChatMenuButton")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
  })
  .onCallback(async (context, func) => {
    const [chat_id] = await func.resolveFields(context);

    const result = await context.telegram.getChatMenuButton(chat_id);
    return func.resolve(result);
  });
