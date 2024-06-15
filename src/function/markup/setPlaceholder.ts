import { KeyboardOptionsID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setPlaceholder")
  .setBrackets(true)
  .setFields({
    name: "inputFieldPlaceholder",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [inputFieldPlaceholder] = await func.resolveFields(context);
    const options = context.variable.get(KeyboardOptionsID);
    options["input_field_placeholder"] = inputFieldPlaceholder;
    context.variable.set(KeyboardOptionsID, options);
    return func.resolve();
  });
