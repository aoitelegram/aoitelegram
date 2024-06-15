import { KeyboardOptionsID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setOneTime")
  .setBrackets(true)
  .setFields({
    name: "oneTimeKeyboard",
    required: true,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [oneTimeKeyboard] = await func.resolveFields(context);
    const options = context.variable.get(KeyboardOptionsID);
    options["one_time_keyboard"] = oneTimeKeyboard;
    context.variable.set(KeyboardOptionsID, options);
    return func.resolve();
  });
