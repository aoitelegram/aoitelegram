import { KeyboardID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$deleteKeyboard")
  .setBrackets(true)
  .setFields({
    name: "index",
    required: true,
    type: [ArgsType.Number, ArgsType.String],
  })
  .setFields({
    name: "position",
    required: false,
    type: [ArgsType.Number, ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [index, position] = await func.resolveFields(context);
    const markup = context.variable.get(KeyboardID);

    if (position === "all" && typeof index === "number") {
      markup[index - 1].keyboard.splice();
    }

    if (position === "number" && typeof index === "number") {
      markup[index - 1].keyboard.forEach((item: any[]) =>
        item.splice(position - 1, 1),
      );
    }

    if (typeof index === "number") {
      delete markup[index - 1];
    }

    context.variable.set(KeyboardID, markup);
    return func.resolve();
  });
