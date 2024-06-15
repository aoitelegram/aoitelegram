import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getMyDefaultAdministratorRights")
  .setBrackets(true)
  .setFields({
    name: "for_channels",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [for_channels] = await func.resolveFields(context);

    const result =
      await context.telegram.getMyDefaultAdministratorRights(for_channels);
    return func.resolve(result);
  });
