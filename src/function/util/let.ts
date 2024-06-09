import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$let")
  .setBrackets(true)
  .setFields({ name: "key", type: [ArgsType.Any], required: true })
  .setFields({ name: "value", type: [ArgsType.Any], required: true })
  .onCallback(async (context, func) => {
    const [name, value] = await func.resolveFields(context);
    context.variable.set(name, value);
    return func.resolve();
  });
