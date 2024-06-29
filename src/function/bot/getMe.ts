import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getMe")
  .setBrackets(true)
  .setFields({
    name: "data",
    required: true,
    type: [ArgsType.String]
  })
  .onCallback(async (context, func) => {
    const [data] = await func.resolveFields(context);
    const getme = await context.telegram.getMe()
    return func.resolve((getme as Record<string, any>)[data]);
  });