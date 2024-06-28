import { getObjectKey } from "@utils/Helpers";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getReactions")
  .setBrackets(true)
  .setFields({
    name: "property",
    required: false,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [property] = await func.resolveFields(context);

    return func.resolve(getObjectKey(context.eventData.reactions, property));
  });
