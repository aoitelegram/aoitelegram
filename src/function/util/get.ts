import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$get")
  .setBrackets(true)
  .setFields({ name: "key", type: [ArgsType.Any], required: true })
  .onCallback(async (context, func) => {
    const [name] = await func.resolveFields(context);
    return func.resolve(context.variable.get(name));
  });
