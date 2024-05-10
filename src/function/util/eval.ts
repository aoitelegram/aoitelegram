import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$eval")
  .setBrackets(true)
  .setFields({ name: "code", type: [ArgsType.String], required: true })
  .onCallback(async (context, func) => {
    const result = await context.telegram.evaluateCommand(
      {
        code: await func.resolveCode(context, `${func.inside}`),
      },
      context.eventData,
    );
    return func.resolve(result);
  });
