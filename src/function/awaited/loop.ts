import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$loop")
  .setBrackets(true)
  .setFields({
    name: "count",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "awaitedData",
    required: true,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "awaitedCmd",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [count, awaitedData, awaitedCmd] = await func.resolveFields(context);
    context.telegram.emit(
      "addAwaited",
      { name: awaitedCmd, outData: awaitedData, count },
      context,
    );
    return func.resolve();
  });
