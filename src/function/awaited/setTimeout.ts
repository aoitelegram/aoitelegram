import ms from "ms";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setTimeout")
  .setBrackets(true)
  .setFields({
    name: "timeoutId",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "time",
    required: true,
    type: [ArgsType.Time],
  })
  .setFields({
    name: "timeoutData",
    required: false,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [timeoutId, { ms }, timeoutData] = await func.resolveFields(context);

    return func.resolve(
      await context.telegram.timeoutManager.addTimeout(timeoutId, {
        time: ms,
        outData: timeoutData || {},
      }),
    );
  });
