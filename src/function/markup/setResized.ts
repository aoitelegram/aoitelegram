import { KeyboardOptionsID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setResized")
  .setBrackets(true)
  .setFields({
    name: "resizeKeyboard",
    required: true,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [resizeKeyboard] = await func.resolveFields(context);
    const options = context.variable.get(KeyboardOptionsID);
    options["resize_keyboard"] = resizeKeyboard;
    context.variable.set(KeyboardOptionsID, options);
    return func.resolve();
  });
