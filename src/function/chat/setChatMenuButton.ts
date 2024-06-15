import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatMenuButton")
  .setBrackets(true)
  .setFields({
    name: "menu_button",
    required: false,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .onCallback(async (context, func) => {
    const [menu_button, chat_id] = await func.resolveFields(context);

    const result = await context.telegram.setChatMenuButton(
      chat_id,
      menu_button,
    );
    return func.resolve(result);
  });
