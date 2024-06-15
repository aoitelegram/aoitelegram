import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setMyDefaultAdministratorRights")
  .setBrackets(true)
  .setFields({
    name: "rights",
    required: false,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "for_channels",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [rights, for_channels] = await func.resolveFields(context);

    const result = await context.telegram.setMyDefaultAdministratorRights(
      rights,
      for_channels,
    );
    return func.resolve(result);
  });
