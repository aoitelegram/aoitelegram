import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatMenuButton")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "menu_button",
    required: false,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [chat_id, menu_button] = await func.resolveFields(context);

    const result = await context.telegram.setChatMenuButton(
      chat_id,
      menu_button,
    );
    return func.resolve(result);
  });
