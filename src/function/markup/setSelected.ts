import { KeyboardOptionsID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setSelected")
  .setBrackets(true)
  .setFields({
    name: "selected",
    required: true,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [selected] = await func.resolveFields(context);
    const options = context.variable.get(KeyboardOptionsID);
    options["selected"] = selected;
    context.variable.set(KeyboardOptionsID, options);
    return func.resolve();
  });
