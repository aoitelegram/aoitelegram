import { InlineKeyboardID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$deleteInlineKeyboard")
  .setBrackets(true)
  .setFields({
    name: "index",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "position",
    required: false,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [index, position] = await func.resolveFields(context);
    const markup = context.variable.get(InlineKeyboardID);

    if (position === "all" && typeof index === "number") {
      markup[index - 1].inline_keyboard.splice();
    }

    if (position === "number" && typeof index === "number") {
      markup[index - 1].inline_keyboard.forEach((item: any[]) =>
        item.splice(position - 1, 1),
      );
    }

    if (typeof index === "number") {
      delete markup[index - 1];
    }

    context.variable.set(InlineKeyboardID, markup);
    return func.resolve();
  });
