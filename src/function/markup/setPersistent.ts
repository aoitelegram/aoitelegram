import { KeyboardOptionsID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setPersistent")
  .setBrackets(true)
  .setFields({
    name: "persistent",
    required: true,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [persistent] = await func.resolveFields(context);
    const options = context.variable.get(KeyboardOptionsID);
    options["persistent"] = persistent;
    context.variable.set(KeyboardOptionsID, options);
    return func.resolve();
  });
