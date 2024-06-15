import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getBusinessConnection")
  .setBrackets(true)
  .setFields({
    name: "business_connection_id",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [business_connection_id] = await func.resolveFields(context);

    const result = await context.telegram.getBusinessConnection(
      business_connection_id,
    );
    return func.resolve(result);
  });
