import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getStarTransactions")
  .setBrackets(true)
  .setFields({
    name: "offset",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "limit",
    required: false,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [offset, limit] = await func.resolveFields(context);
    return func.resolve(
      await context.telegram.getStarTransactions(offset, limit),
    );
  });
