import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$eval")
  .setBrackets(true)
  .setFields({ required: true })
  .onCallback(async (context, func) => {
    const result = await context.telegram.evaluateCommand(
      {
        code: func.inside,
      },
      context.eventData,
    );
    return func.resolve(result);
  });
